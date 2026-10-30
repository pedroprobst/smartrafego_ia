import os
import shutil
import uuid
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List
from yolo_model import YoloDetector

app = FastAPI(title="SmarTrafego AI - Detection Service")

# Enable CORS for Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector (loads YOLO model)
detector = YoloDetector()

# Establish raw upload and processed image directory locations
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
PROCESSED_DIR = os.path.join(BASE_DIR, "processed")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

class VehicleResponse(BaseModel):
    category: str
    confidence: float
    x: float
    y: float
    width: float
    height: float

class AnalysisResponse(BaseModel):
    status: str
    filename: str
    processed_filename: str
    processing_time: float
    vehicles: List[VehicleResponse]

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "message": "SmarTrafego AI detection server is running.",
        "yolo_model": os.path.basename(detector.config.get("model_path", "unknown"))
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(file: UploadFile = File(...)):
    # Verify file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Supported: JPG, PNG, WEBP, BMP.")
        
    # Generate a unique uuid filename to prevent overwriting
    unique_filename = f"{uuid.uuid4()}{ext}"
    input_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the uploaded file locally in uploads/
    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write image file: {str(e)}")
        
    # Process through YOLOv11 and save annotated version to processed/
    try:
        result = detector.detect(input_path, PROCESSED_DIR)
    except Exception as e:
        # Clean raw upload if analysis fails
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")
        
    return {
        "status": "success",
        "filename": unique_filename,
        "processed_filename": result["processed_filename"],
        "processing_time": result["processing_time"],
        "vehicles": result["vehicles"]
    }

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
