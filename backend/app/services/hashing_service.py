from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Dict


def calculate_file_sha256(file_path: Path, block_size: int = 65536) -> str:
    """
    Calculate SHA-256 hash of a file in a memory-efficient chunked manner.
    """
    sha256_hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(block_size), b""):
            sha256_hasher.update(chunk)
    return sha256_hasher.hexdigest().upper()


def calculate_forensic_hashes(file_path: Path) -> Dict[str, str]:
    """
    Calculate SHA-256, SHA-1, and MD5 for complete forensic cross-verification.
    """
    sha256_hasher = hashlib.sha256()
    sha1_hasher = hashlib.sha1()
    md5_hasher = hashlib.md5()

    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256_hasher.update(chunk)
            sha1_hasher.update(chunk)
            md5_hasher.update(chunk)

    return {
        "sha256": sha256_hasher.hexdigest().upper(),
        "sha1": sha1_hasher.hexdigest().upper(),
        "md5": md5_hasher.hexdigest().upper(),
    }
