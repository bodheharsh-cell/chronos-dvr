from backend.app.analyzers.base import BaseAnalyzer
from backend.app.analyzers.generic_video import GenericVideoAnalyzer
from backend.app.analyzers.hikvision import HikvisionAnalyzer
from backend.app.analyzers.dahua import DahuaAnalyzer

ALL_ANALYZERS = [
    HikvisionAnalyzer(),
    DahuaAnalyzer(),
    GenericVideoAnalyzer(),
]

__all__ = ["BaseAnalyzer", "GenericVideoAnalyzer", "HikvisionAnalyzer", "DahuaAnalyzer", "ALL_ANALYZERS"]
