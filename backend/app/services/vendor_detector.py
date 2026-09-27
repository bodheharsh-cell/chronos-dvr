from __future__ import annotations

from pathlib import Path
from typing import Dict, Any, Tuple
from backend.app.analyzers import ALL_ANALYZERS, BaseAnalyzer, GenericVideoAnalyzer


def detect_vendor(file_path: Path, filename: str) -> Tuple[BaseAnalyzer, Dict[str, Any]]:
    """
    Evaluates registered vendor analyzers against the target evidence file.
    Returns the chosen analyzer and detection diagnostics.
    """
    header_bytes = b""
    try:
        with open(file_path, "rb") as f:
            header_bytes = f.read(1024)
    except Exception:
        pass

    best_analyzer = None
    best_confidence = -1.0
    best_reason = "No analyzer matched"

    for analyzer in ALL_ANALYZERS:
        can_handle, confidence, reason = analyzer.can_analyze(file_path, filename, header_bytes)
        if can_handle and confidence > best_confidence:
            best_confidence = confidence
            best_analyzer = analyzer
            best_reason = reason

    if best_analyzer is None or best_confidence < 0.3:
        best_analyzer = GenericVideoAnalyzer()
        best_confidence = 0.5
        best_reason = "Fallback to generic video analyzer"

    detection_info = {
        "vendor": best_analyzer.vendor_code,
        "vendor_name": best_analyzer.vendor_name,
        "confidence": round(best_confidence, 2),
        "detection_reason": best_reason,
        "container_probe_size": len(header_bytes),
    }

    return best_analyzer, detection_info
