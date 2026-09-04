from pathlib import Path
import base64
import io

import numpy as np
import torch
import torch.nn.functional as F
import timm
from PIL import Image
from torchvision import transforms


PROJECT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_DIR / "models" / "melanoma_efficientnet_b0.pth"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMAGE_SIZE = 224

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model checkpoint not found: {MODEL_PATH}"
        )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE,
        weights_only=False
    )

    model = timm.create_model(
        "efficientnet_b0",
        pretrained=False,
        num_classes=1
    )

    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

    threshold = float(checkpoint.get("threshold", 0.40))

    return model, threshold


# Load once when the API starts
MODEL, THRESHOLD = load_model()

# Grad-CAM target layer
TARGET_LAYER = MODEL.blocks[-1][-1].conv_pwl


def predict(image_path):
    image = Image.open(image_path).convert("RGB")
    image_tensor = TRANSFORM(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = MODEL(image_tensor)
        malignant_probability = torch.sigmoid(output).item()

    benign_probability = 1.0 - malignant_probability

    prediction = (
        "malignant"
        if malignant_probability >= THRESHOLD
        else "benign"
    )

    return {
        "prediction": prediction,
        "malignant_probability": malignant_probability,
        "benign_probability": benign_probability,
        "threshold": THRESHOLD,
        "device": str(DEVICE),
    }


def generate_gradcam(image_tensor):
    activations = []
    gradients = []

    def forward_hook(module, inputs, output):
        activations.append(output)

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    forward_handle = TARGET_LAYER.register_forward_hook(forward_hook)
    backward_handle = TARGET_LAYER.register_full_backward_hook(
        backward_hook
    )

    MODEL.zero_grad()

    image_tensor = image_tensor.unsqueeze(0).to(DEVICE)
    image_tensor.requires_grad_(True)

    output = MODEL(image_tensor)
    output.backward()

    activation = activations[0]
    gradient = gradients[0]

    weights = gradient.mean(
        dim=(2, 3),
        keepdim=True
    )

    cam = (weights * activation).sum(
        dim=1,
        keepdim=True
    )

    cam = F.relu(cam)

    cam = F.interpolate(
        cam,
        size=(IMAGE_SIZE, IMAGE_SIZE),
        mode="bilinear",
        align_corners=False
    )

    cam = cam.squeeze().detach().cpu().numpy()

    cam = (
        (cam - cam.min()) /
        (cam.max() - cam.min() + 1e-8)
    )

    forward_handle.remove()
    backward_handle.remove()

    return cam


def create_gradcam_image(image_path):
    image = Image.open(image_path).convert("RGB")

    image_tensor = TRANSFORM(image)

    cam = generate_gradcam(image_tensor)

    original = np.array(
        image.resize((IMAGE_SIZE, IMAGE_SIZE))
    ).astype(np.float32)

    # Simple heatmap approximation
    heatmap = np.zeros(
        (IMAGE_SIZE, IMAGE_SIZE, 3),
        dtype=np.float32
    )

    heatmap[:, :, 0] = cam
    heatmap[:, :, 1] = 1.0 - cam
    heatmap[:, :, 2] = 0.0

    overlay = (
        0.55 * original +
        0.45 * heatmap * 255.0
    )

    overlay = np.clip(
        overlay,
        0,
        255
    ).astype(np.uint8)

    output_image = Image.fromarray(overlay)

    buffer = io.BytesIO()
    output_image.save(buffer, format="PNG")

    return base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")
