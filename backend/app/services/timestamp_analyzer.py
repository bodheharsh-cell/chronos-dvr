from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, Any, List, Optional
import cv2


# Regular expressions for common CCTV OSD timestamp patterns:
# 2026-09-28 01:45:00, 28/09/2026 01:45:00, 2026/09/28, 01:45:00
TIMESTAMP_REGEXES = [
    re.compile(r"\b(\d{4}[-/.]\d{2}[-/.]\d{2}\s+\d{2}:\d{2}:\d{2})\b"),
    re.compile(r"\b(\d{2}[-/.]\d{2}[-/.]\d{4}\s+\d{2}:\d{2}:\d{2})\b"),
    re.compile(r"\b(\d{2}:\d{2}:\d{2})\b"),
]


def extract_timestamp_from_frame(frame_path: Path) -> Dict[str, Any]:
    """
    Attempt OCR on header/footer region where DVR OSD timestamps reside.
    If OCR library is unavailable or no pattern matches, returns:
    'Timestamp not confidently detected'
    """
    if not frame_path.exists():
        return {
            "status": "NOT_DETECTED",
            "detected_timestamp": "Timestamp not confidently detected",
            "confidence": 0.0,
            "region": None,
        }

    img = cv2.imread(str(frame_path))
    if img is None:
        return {
            "status": "NOT_DETECTED",
            "detected_timestamp": "Timestamp not confidently detected",
            "confidence": 0.0,
            "region": None,
        }

    h, w, _ = img.shape
    # Top banner & bottom banner are standard for Hikvision / Dahua OSD
    top_banner = img[0:int(h * 0.20), :]
    bottom_banner = img[int(h * 0.80):, :]

    ocr_text = ""
    try:
        import pytesseract
        # Try OCR on preprocessed grayscale high-contrast slices
        for banner in [top_banner, bottom_banner]:
            gray = cv2.cvtColor(banner, cv2.COLOR_BGR2GRAY)
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            text = pytesseract.image_to_string(thresh, config="--psm 6")
            if text:
                ocr_text += " " + text
    except Exception:
        # Pytesseract or tesseract binary not installed in Windows PATH
        pass

    if ocr_text:
        for pattern in TIMESTAMP_REGEXES:
            match = pattern.search(ocr_text)
            if match:
                return {
                    "status": "DETECTED",
                    "detected_timestamp": match.group(1),
                    "confidence": 0.88,
                    "region": "OSD_HEADER",
                }

    # Return honest fallback
    return {
        "status": "NOT_DETECTED",
        "detected_timestamp": "Timestamp not confidently detected",
        "confidence": 0.0,
        "region": None,
    }


def analyze_sampled_timestamps(samples: List[Dict[str, Any]], frames_dir: Path) -> List[Dict[str, Any]]:
    results = []
    for sample in samples:
        thumb_file = sample.get("thumbnail_file")
        if thumb_file:
            thumb_path = frames_dir / thumb_file
            ts_res = extract_timestamp_from_frame(thumb_path)
            sample_copy = dict(sample)
            sample_copy["ocr_analysis"] = ts_res
            results.append(sample_copy)
        else:
            results.append(sample)
    return results
