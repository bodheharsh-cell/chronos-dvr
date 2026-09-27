from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, List


class BaseAnalyzer(ABC):
    """
    Abstract Base Class for DVR / Video Forensic Analyzers.
    Provides pluggable interface for vendor-specific DVR container, index,
    stream reconstruction, and video parsing.
    """

    vendor_name: str = "Generic"
    vendor_code: str = "GENERIC"

    @abstractmethod
    def can_analyze(self, file_path: Path, filename: str, header_bytes: bytes) -> tuple[bool, float, str]:
        """
        Evaluate if this analyzer can handle the evidence.
        Returns: (can_handle, confidence_0_to_1, detection_reason)
        """
        pass

    @abstractmethod
    def analyze_metadata(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract low-level container and video stream metadata.
        """
        pass

    @abstractmethod
    def extract_keyframes_and_timestamps(
        self, file_path: Path, output_dir: Path, sample_interval_seconds: float = 2.0
    ) -> List[Dict[str, Any]]:
        """
        Extract representative sampled frames and detect visual/embedded timestamps.
        """
        pass
