# Melanoma AI Screening — Frontend

A professional medical-AI web dashboard for AI-assisted melanoma skin lesion screening. Built with React, Vite, TypeScript, and Tailwind CSS v4.

## Architecture

```
frontend/
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Top navigation bar
│   │   ├── ImageUploader.tsx   # Drag-and-drop image upload
│   │   ├── AnalyzeButton.tsx   # Primary action button
│   │   ├── ResultCard.tsx      # Prediction result display
│   │   ├── ProbabilityDisplay.tsx  # Probability bars
│   │   ├── ImageComparison.tsx # Original vs Grad-CAM side-by-side
│   │   ├── GradCamViewer.tsx   # Grad-CAM visualization
│   │   ├── Disclaimer.tsx      # Clinical disclaimer
│   │   └── CaseSummary.tsx     # Analysis summary card
│   ├── services/
│   │   └── api.ts              # Backend API communication
│   ├── types/
│   │   └── prediction.ts       # TypeScript interfaces
│   ├── App.tsx                 # Main dashboard
│   ├── main.tsx                # React entry point
│   └── index.css               # Tailwind CSS + custom styles
```

## Prerequisites

- **Node.js** 18+ and npm
- **Backend** running at `http://localhost:8000`

## Quick Start

### 1. Start the backend

```bash
cd ~/melanoma-project
source .venv/bin/activate
uvicorn src.api:app --host 0.0.0.0 --port 8000
```

### 2. Start the frontend (in a separate terminal)

```bash
cd ~/melanoma-project/frontend
npm install
npm run dev
```

### 3. Open the application

Navigate to: [http://localhost:5173](http://localhost:5173)

## How It Works

1. Upload a dermoscopic or clinical skin lesion image (JPG, PNG, or WEBP)
2. Click **Analyze Image**
3. The frontend sends a `POST` request to `http://localhost:8000/predict` with the image as `multipart/form-data` (field name: `file`)
4. The backend runs EfficientNet-B0 inference and returns prediction probabilities + Grad-CAM heatmap
5. Results are displayed with probability bars, original vs Grad-CAM comparison, and a case summary

## API Connection

The frontend communicates with:

```
POST http://localhost:8000/predict
Content-Type: multipart/form-data
Field: file (image)
```

Response:
```json
{
  "prediction": "benign" | "malignant",
  "malignant_probability": 0.XX,
  "benign_probability": 0.XX,
  "threshold": 0.40,
  "device": "cuda",
  "gradcam": "data:image/png;base64,..."
}
```

## CORS

The backend includes CORS middleware allowing requests from `http://localhost:5173`.

## Disclaimer

This is an AI-assisted screening tool for educational purposes. It does not provide a definitive medical diagnosis. Always consult a qualified healthcare professional.
