import type { PredictionResult } from "../types/prediction";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function analyzeSkinLesion(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        "Unable to connect to the analysis server. Please ensure the backend is running at " + API_BASE,
        0,
        "Network error"
      );
    }
    throw new ApiError("An unexpected error occurred while connecting to the server.");
  }

  if (!response.ok) {
    let detail = "Server error";
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || detail;
    } catch {
      // response body is not JSON
    }
    throw new ApiError(
      `Analysis failed (HTTP ${response.status}): ${detail}`,
      response.status,
      detail
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Received an invalid response from the server.");
  }

  if (!data || typeof data !== "object") {
    throw new ApiError("Received a malformed response from the server.");
  }

  // Handle unsupported image response
  if (data.status === "unsupported" || data.prediction === "UNSUPPORTED") {
    if (!data.suitability || typeof data.suitability !== "object") {
      throw new ApiError("Received an invalid unsupported image response (missing suitability data).");
    }
    return data as unknown as PredictionResult;
  }

  // Handle suitable image prediction response
  if (
    !("prediction" in data) ||
    !("malignant_probability" in data) ||
    !("benign_probability" in data) ||
    !("threshold" in data) ||
    !("device" in data)
  ) {
    throw new ApiError("Received a malformed response from the server. Expected prediction data.");
  }

  return data as unknown as PredictionResult;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
