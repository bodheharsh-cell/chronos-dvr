from __future__ import annotations

from pathlib import Path
import cv2
import numpy as np


def generate_synthetic_cctv_video(
    output_path: Path,
    fps: int = 25,
    width: int = 640,
    height: int = 360,
    duration_seconds: int = 12,
    simulate_gap: bool = True,
) -> Path:
    """
    Generates a lightweight, valid MP4 video simulating CCTV footage:
    - OSD timestamp banner (Hikvision/CCTV style)
    - Moving objects / activity
    - Optional simulated time gap (e.g., jump from 01:45:04 to 01:45:12)
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(output_path), fourcc, float(fps), (width, height))

    total_frames = fps * duration_seconds
    base_second = 0

    for i in range(total_frames):
        # Frame elapsed time
        current_time_sec = i / fps
        
        # Simulate a 10-second gap jump around 4.0s mark if enabled
        if simulate_gap and current_time_sec >= 4.0:
            effective_time_sec = current_time_sec + 10.0
            gap_active = True
        else:
            effective_time_sec = current_time_sec
            gap_active = False

        # Create dark CCTV-style frame (security corridor / parking view background)
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (24, 28, 32)  # Dark slate gray

        # Draw grid lines / corridor perspective
        cv2.line(frame, (0, height), (int(width * 0.4), int(height * 0.45)), (50, 55, 60), 1)
        cv2.line(frame, (width, height), (int(width * 0.6), int(height * 0.45)), (50, 55, 60), 1)
        cv2.rectangle(frame, (int(width * 0.4), int(height * 0.45)), (int(width * 0.6), int(height * 0.75)), (40, 45, 50), -1)

        # Draw a moving box (simulating moving person / vehicle)
        box_x = int((i * 4) % (width - 60))
        box_y = int(height * 0.55 + np.sin(i * 0.1) * 20)
        cv2.rectangle(frame, (box_x, box_y), (box_x + 45, box_y + 45), (70, 130, 180), -1)
        cv2.rectangle(frame, (box_x, box_y), (box_x + 45, box_y + 45), (100, 200, 255), 2)

        # OSD Header Background Banner
        cv2.rectangle(frame, (0, 0), (width, 42), (10, 10, 10), -1)
        cv2.line(frame, (0, 42), (width, 42), (60, 60, 60), 1)

        # Timestamp text
        mins = int(effective_time_sec // 60)
        secs = int(effective_time_sec % 60)
        millis = int((effective_time_sec - int(effective_time_sec)) * 100)
        ts_text = f"CAM-01 [HIKVISION-NVR]  2026-09-28 01:45:{secs:02d}.{millis:02d}"

        cv2.putText(
            frame,
            ts_text,
            (14, 28),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (240, 240, 240),
            1,
            cv2.LINE_AA,
        )

        # Frame counter & metadata indicator in footer
        cv2.rectangle(frame, (0, height - 26), (width, height), (10, 10, 10), -1)
        cv2.putText(
            frame,
            f"FRAME #{i:04d} | CHRONOS FORENSIC STREAM SAMPLER | LIVE REC",
            (14, height - 8),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.40,
            (160, 160, 160),
            1,
            cv2.LINE_AA,
        )

        out.write(frame)

    out.release()
    return output_path
