from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
from pydantic import BaseModel
import io
import base64
from PIL import Image
import numpy as np
from ultralytics import YOLO
import cv2
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.getLogger().setLevel(logging.CRITICAL)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8090"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
model = YOLO("yolov8n.pt")

class DetectionResult(BaseModel):
    message: str
    image: str

def detect_objects(image: Image.Image):
    img = np.array(image)
    results = model(img)
    class_names = model.names

    for result in results:
        boxes = result.boxes.xyxy
        confidences = result.boxes.conf
        class_ids = result.boxes.cls
        for box, confidence, class_id in zip(boxes, confidences, class_ids):
            x1, y1, x2, y2 = map(int, box)
            label = class_names[int(class_id)]
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, f'{label} {confidence:.2f}', (x1,y1), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    result_image =Image.fromarray(img)
    return result_image



@app.get("/")
async def reed_root():
    return {"message": "Hello fastAPI"}


@app.post("/detect", response_model=DetectionResult)
async def detect_service(message: str = Form(...), file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read()))
    if image.mode == 'RGBA':
        image = image.convert('RGB')
    elif image.mode != 'RGB':
        image = image.convert('RGB')

    result_image = detect_objects(image)

    buffered = io.BytesIO()
    result_image.save(buffered, format="JPEG")

    img_str =base64.b64encode(buffered.getvalue()).decode('utf-8')

    return DetectionResult(message=message, image=img_str)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)