from __future__ import annotations

import os
from pathlib import Path
import cv2
from typing import Dict, Any, List, Tuple
from backend.app.analyzers.base import BaseAnalyzer


class GenericVideoAnalyzer(BaseAnalyzer):
    vendor_name: str = "Generic/Standard Video"
    vendor_code: str = "GENERIC"

    def can_analyze(self, file_path: Path, filename: str, header_bytes: bytes) -> tuple[bool, float, str]:
        ext = file_path.suffix.lower()
        if ext in [".mp4", ".avi", ".mkv", ".mov", ".m4v", ".ts", ".webm"]:
            return True, 0.85, f"Standard container extension ({ext})"
        
        # Check standard magic numbers
        if len(header_bytes) >= 12:
            if header_bytes[4:8] in [b"ftyp", b"moov", b"mdat"]:
                return True, 0.90, "ISO Base Media File Format (MP4/MOV) container detected"
            if header_bytes[0:4] == b"RIFF" and header_bytes[8:12] == b"AVI ":
                return True, 0.90, "AVI RIFF container detected"
            if header_bytes[0:4] == b"\x1a\x45\xdf\xa3":
                return True, 0.90, "Matroska (MKV) container detected"

        return False, 0.20, "Generic container fallback"

    def analyze_metadata(self, file_path: Path) -> Dict[str, Any]:
        cap = cv2.VideoCapture(str(file_path))
        if not cap.isOpened():
            return {
                "codec": "UNKNOWN",
                "width": 0,
                "height": 0,
                "fps": 0.0,
                "frame_count": 0,
                "duration": 0.0,
                "bitrate": 0,
                "container": file_path.suffix.lstrip(".").upper(),
                "status": "FAILED_TO_OPEN",
                "is_dvr_raw": False,
            }

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        fourcc_int = int(cap.get(cv2.CAP_PROP_FOURCC) or 0)

        # Decode fourcc
        fourcc_chars = [chr((fourcc_int >> 8 * i) & 0xFF) for i in range(4)]
        fourcc = "".join([c if 32 <= ord(c) <= 126 else "" for c in fourcc_chars]).strip()
        codec = fourcc if fourcc else "H.264 (AVC)"

        duration = frame_count / fps if fps > 0 and frame_count > 0 else 0.0

        file_size = file_path.stat().st_size if file_path.exists() else 0
        bitrate = int((file_size * 8) / duration) if duration > 0 else 0

        cap.release()

        return {
            "codec": codec,
            "width": width,
            "height": height,
            "resolution": f"{width}x{height}" if width and height else "Unknown",
            "fps": round(fps, 2),
            "frame_count": frame_count,
            "duration": round(duration, 2),
            "bitrate": bitrate,
            "container": file_path.suffix.lstrip(".").upper() or "UNKNOWN",
            "is_dvr_raw": False,
            "status": "VALID",
        }

    def extract_keyframes_and_timestamps(
        self, file_path: Path, output_dir: Path, sample_interval_seconds: float = 2.0
    ) -> List[Dict[str, Any]]:
        output_dir.mkdir(parents=True, exist_ok=True)
        cap = cv2.VideoCapture(str(file_path))
        if not cap.isOpened():
            return []

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        total_duration = frame_count / fps if fps > 0 else 0.0

        sample_step_frames = max(1, int(fps * sample_interval_seconds))
        sampled_frames = []

        curr_frame_idx = 0
        prev_gray = None

        while True:
            cap.set(cv2.CAP_PROP_POS_FRAMES, curr_frame_idx)
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            timestamp_sec = round(curr_frame_idx / fps, 2)
            thumb_filename = f"thumb_{curr_frame_idx}_{timestamp_sec}s.jpg"
            thumb_path = output_dir / thumb_filename

            # Save thumbnail
            resized = cv2.resize(frame, (480, 270), interpolation=cv2.INTER_AREA)
            cv2.imwrite(str(thumb_path), resized, [cv2.IMWRITE_JPEG_QUALITY, 85])

            # Motion / scene change estimation
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            motion_score = 0.0
            if prev_gray is not None:
                diff = cv2.absdiff(gray, prev_gray)
                motion_score = float(diff.mean())
            prev_gray = gray

            sampled_frames.append({
                "frame_index": curr_frame_idx,
                "timestamp_seconds": timestamp_sec,
                "timestamp_str": f"{int(timestamp_sec // 60):02d}:{int(timestamp_sec % 60):02d}",
                "thumbnail_file": thumb_filename,
                "motion_score": round(motion_score, 2),
            })

            curr_frame_idx += sample_step_frames
            if curr_frame_idx >= frame_count and frame_count > 0:
                break

        cap.release()
        return sampled_frames
