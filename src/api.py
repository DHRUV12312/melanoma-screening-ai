from pathlib import Path
import shutil
import tempfile

import torch
from torchvision.models import efficientnet_b0

from PIL import Image
from torchvision import transforms

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.melanoma_model import predict, create_gradcam_image


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

SUITABILITY_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "lesion_suitability_efficientnet_b0_realworld.pth"
)


# ============================================================
# DEVICE
# ============================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# LOAD SUITABILITY MODEL
# ============================================================

suitability_checkpoint = torch.load(
    SUITABILITY_MODEL_PATH,
    map_location=device,
    weights_only=False,
)

suitability_model = efficientnet_b0(weights=None)

suitability_model.classifier[1] = torch.nn.Linear(
    suitability_model.classifier[1].in_features,
    1,
)

suitability_model.load_state_dict(
    suitability_checkpoint["model_state_dict"]
)

suitability_model = suitability_model.to(device)
suitability_model.eval()

SUITABILITY_THRESHOLD = suitability_checkpoint.get(
    "threshold",
    0.5
)


# ============================================================
# SUITABILITY PREPROCESSING
# ============================================================

suitability_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225],
    ),
])


# ============================================================
# SUITABILITY CHECK
# ============================================================

def check_image_suitability(image_path: Path):

    image = Image.open(image_path).convert("RGB")

    image_tensor = suitability_transform(
        image
    ).unsqueeze(0).to(device)

    with torch.no_grad():

        output = suitability_model(
            image_tensor
        )

        unsupported_probability = (
            torch.sigmoid(output).item()
        )

    suitable_probability = (
        1.0 - unsupported_probability
    )

    is_unsupported = (
        unsupported_probability
        >= SUITABILITY_THRESHOLD
    )

    return {
        "is_unsupported": is_unsupported,
        "suitable_probability": suitable_probability,
        "unsupported_probability": unsupported_probability,
    }


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Melanoma AI API",
    description="AI-assisted melanoma screening API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Melanoma AI API is running"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# PREDICT
# ============================================================

@app.post("/predict")
async def predict_image(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    if not file.content_type:
        raise HTTPException(
            status_code=400,
            detail="Missing file type."
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )

    # --------------------------------------------------------
    # Create temporary file
    # --------------------------------------------------------

    suffix = Path(
        file.filename or ""
    ).suffix or ".jpg"

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            shutil.copyfileobj(
                file.file,
                temp_file
            )

            temp_path = Path(
                temp_file.name
            )

        # ====================================================
        # STEP 1 — IMAGE SUITABILITY CHECK
        # ====================================================

        suitability = check_image_suitability(
            temp_path
        )

        # ====================================================
        # UNSUPPORTED IMAGE
        # ====================================================

        if suitability["is_unsupported"]:

            return {
                "status": "unsupported",
                "prediction": "UNSUPPORTED",

                "message": (
                    "This image is not suitable "
                    "for melanoma screening. "
                    "Please upload a clear, "
                    "close-up image of a skin lesion."
                ),

                "suitability": {
                    "suitable_probability": round(
                        suitability[
                            "suitable_probability"
                        ] * 100,
                        2
                    ),

                    "unsupported_probability": round(
                        suitability[
                            "unsupported_probability"
                        ] * 100,
                        2
                    ),

                    "threshold": round(
                        SUITABILITY_THRESHOLD * 100,
                        2
                    ),
                },

                "gradcam": None,
            }

        # ====================================================
        # STEP 2 — EXISTING MELANOMA MODEL
        # ====================================================

        result = predict(
            temp_path
        )

        # ====================================================
        # STEP 3 — EXISTING GRAD-CAM
        # ====================================================

        gradcam_base64 = create_gradcam_image(
            temp_path
        )

        result["gradcam"] = (
            "data:image/png;base64,"
            + gradcam_base64
        )

        # ====================================================
        # ADD SUITABILITY INFORMATION
        # ====================================================

        result["status"] = "success"

        result["suitability"] = {
            "suitable_probability": round(
                suitability[
                    "suitable_probability"
                ] * 100,
                2
            ),

            "unsupported_probability": round(
                suitability[
                    "unsupported_probability"
                ] * 100,
                2
            ),

            "threshold": round(
                SUITABILITY_THRESHOLD * 100,
                2
            ),
        }

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if (
            temp_path
            and temp_path.exists()
        ):
            temp_path.unlink()
