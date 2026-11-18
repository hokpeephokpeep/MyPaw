import os
import sys
import io
import re
import base64
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

# Add OpenThai OCR model path
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models" / "OpenThai-OCR"
sys.path.insert(0, str(MODEL_DIR))

try:
    from runtime.line_engine import LineOCR
    ocr_engine = LineOCR(str(MODEL_DIR), threads=2)
    print("✅ OpenThai 2.1 OCR engine loaded successfully from:", MODEL_DIR)
except Exception as e:
    print("❌ Failed to initialize OpenThai OCR:", e)
    ocr_engine = None

app = FastAPI(title="MyPaw OpenThai OCR Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Base64OCRRequest(BaseModel):
    image: str # base64 data url or raw base64 string

def preprocess_and_load_image(img_bytes: bytes) -> Image.Image:
    """Load image (HEIC, PNG, JPEG) and downscale if too large for speed optimization."""
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    w, h = img.size
    max_dim = max(w, h)
    if max_dim > 2048:
        scale = 2048 / max_dim
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    return img

def run_ocr(img: Image.Image):
    if ocr_engine is None:
        raise HTTPException(status_code=500, detail="OpenThai OCR engine is not initialized")
    result = ocr_engine.read(img)
    return result

@app.get("/")
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "engine": "OpenThai 2.0 / 2.1 OCR",
        "modelDir": str(MODEL_DIR),
        "available": ocr_engine is not None
    }

@app.post("/api/ocr")
async def ocr_endpoint(file: Optional[UploadFile] = File(None)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    content = await file.read()
    img = preprocess_and_load_image(content)
    result = run_ocr(img)
    return {
        "success": True,
        "engine": "OpenThai 2.0 OCR",
        "text": result.get("text", ""),
        "lines": result.get("lines", [])
    }

@app.post("/api/ocr/base64")
async def ocr_base64_endpoint(req: Base64OCRRequest):
    img_data = req.image
    if "," in img_data:
        img_data = img_data.split(",", 1)[1]
    raw_bytes = base64.b64decode(img_data)
    img = preprocess_and_load_image(raw_bytes)
    result = run_ocr(img)
    return {
        "success": True,
        "engine": "OpenThai 2.0 OCR",
        "text": result.get("text", ""),
        "lines": result.get("lines", [])
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting OpenThai OCR Server on 0.0.0.0:8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
