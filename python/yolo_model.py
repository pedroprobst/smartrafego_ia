import os
import json
import time
import cv2
import numpy as np
from ultralytics import YOLO

class YoloDetector:
    def __init__(self, config_path=None):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        if config_path is None:
            config_path = os.path.join(script_dir, "detector_config.json")
            
        # Default fallback configuration (COCO with yolo11l.pt)
        self.config = {
            "model_path": "../models/yolo11l.pt",
            "imgsz": 1536,
            "conf": 0.15,
            "iou": 0.45,
            "max_det": 1000,
            "verbose": False,
            "classes": [2, 3, 5, 7],
            "class_mappings": {
                "2": "Carro",
                "3": "Moto",
                "5": "Ônibus",
                "7": "Caminhão"
            },
            "use_van_heuristic": True
        }
        
        # Load from config file if available
        if os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    full_config = json.load(f)
                    active_name = full_config.get("active_config", "coco")
                    active_cfg = full_config.get("configs", {}).get(active_name, {})
                    self.config.update(active_cfg)
                    print(f"[YoloDetector] Loaded active config: '{active_name}'")
            except Exception as e:
                print(f"[YoloDetector] Error loading config JSON, using defaults: {e}")
        else:
            print("[YoloDetector] Configuration file not found, using default coco settings.")
            
        # Process class mappings: build mapping dictionaries supporting both string and integer keys
        self.class_mappings = {}
        for k, v in self.config["class_mappings"].items():
            self.class_mappings[str(k)] = v
            try:
                self.class_mappings[int(k)] = v
            except ValueError:
                pass
                
        # Resolve path for local weights
        model_path = self.config["model_path"]
        # If it is a relative file path (contains separator or ends with .pt) and is not a HF repo ID
        if not (model_path.startswith("http") or (("/" in model_path or "\\" in model_path) and not model_path.endswith(".pt"))):
            if not os.path.isabs(model_path):
                model_path = os.path.abspath(os.path.join(script_dir, model_path))
                
        # Create directories if it's a local file path
        if model_path.endswith(".pt"):
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            
        print(f"[YoloDetector] Initializing YOLO model from: {model_path}")
        self.model = YOLO(model_path)
        
        # Neon-like Color definitions for bounding boxes (BGR for OpenCV)
        self.colors = {
            "Carro": (255, 191, 0),       # Cyan-blue
            "Moto": (0, 255, 127),        # Spring green
            "Caminhão": (0, 128, 255),    # Vibrant Orange
            "Ônibus": (211, 0, 148),      # Deep Pink/Purple
            "Van": (0, 215, 255)          # Neon Yellow/Gold
        }

    def detect(self, image_path, processed_dir="../processed"):
        # Resolve processed directory relative to script path if relative
        if not os.path.isabs(processed_dir):
            script_dir = os.path.dirname(os.path.abspath(__file__))
            processed_dir = os.path.abspath(os.path.join(script_dir, processed_dir))
            
        os.makedirs(processed_dir, exist_ok=True)
        
        # Load image (ensuring original resolution is loaded)
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")
            
        h, w, _ = img.shape
        
        # Prepare dynamic inference arguments
        inference_args = {
            "imgsz": self.config.get("imgsz", 1536),
            "conf": self.config.get("conf", 0.15),
            "iou": self.config.get("iou", 0.45),
            "max_det": self.config.get("max_det", 1000),
            "verbose": self.config.get("verbose", False)
        }
        
        # Filter classes only if classes are explicitly defined
        if self.config.get("classes") is not None:
            inference_args["classes"] = self.config.get("classes")
            
        start_time = time.time()
        # Run inference using original resolution image
        results = self.model(img, **inference_args)
        processing_time = time.time() - start_time
        
        detected_vehicles = []
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                if cls_id not in self.class_mappings:
                    continue
                    
                category = self.class_mappings[cls_id]
                confidence = float(box.conf[0].item())
                
                # Get coordinates
                xyxy = box.xyxy[0].cpu().numpy()
                x1, y1, x2, y2 = map(int, xyxy)
                box_w = x2 - x1
                box_h = y2 - y1
                
                # Aspect-ratio based Van heuristic (large, rectangular cars are often vans)
                # Apply only if use_van_heuristic is enabled in configuration (typically for COCO)
                if category == "Carro" and self.config.get("use_van_heuristic", False):
                    aspect_ratio = max(box_w, box_h) / max(1, min(box_w, box_h))
                    area = box_w * box_h
                    image_area = w * h
                    # Aspect ratio between 1.55 and 2.1, and area taking up at least 0.05% of the view (typical for vans)
                    if aspect_ratio > 1.55 and (area / image_area) > 0.0005:
                        category = "Van"
                
                detected_vehicles.append({
                    "category": category,
                    "confidence": confidence,
                    "x": float(x1 / w),
                    "y": float(y1 / h),
                    "width": float(box_w / w),
                    "height": float(box_h / h),
                    "pixel_coords": [x1, y1, x2, y2]
                })
                
        # Draw bounding boxes on image copy
        annotated_img = img.copy()
        for vehicle in detected_vehicles:
            cat = vehicle["category"]
            conf = vehicle["confidence"]
            x1, y1, x2, y2 = vehicle["pixel_coords"]
            color = self.colors.get(cat, (255, 255, 255))
            
            # Draw box with outline thickness 2
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, 2)
            
            # Draw label banner above the box
            label = f"{cat} {conf:.2f}"
            (l_w, l_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
            
            # Make sure label background is within image boundaries
            banner_y1 = max(0, y1 - l_h - 6)
            cv2.rectangle(annotated_img, (x1, banner_y1), (x1 + l_w + 10, y1), color, -1)
            # Text inside banner (black text for neon high contrast)
            cv2.putText(annotated_img, label, (x1 + 5, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1, cv2.LINE_AA)
            
        # Save processed image
        base_name = os.path.basename(image_path)
        processed_path = os.path.join(processed_dir, base_name)
        cv2.imwrite(processed_path, annotated_img)
        
        # Clean pixel coords from response JSON
        for v in detected_vehicles:
            del v["pixel_coords"]
            
        return {
            "vehicles": detected_vehicles,
            "processing_time": processing_time,
            "processed_filename": base_name
        }

