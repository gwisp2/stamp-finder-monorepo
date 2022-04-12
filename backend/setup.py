#!/usr/bin/env python3
from setuptools import find_packages, setup

setup(
    name="stamp-finder-backend",
    version="0.0.1",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    install_requires=[
        "pydantic",
        "pyyaml",
        "docopt",
        "loguru",
        "stamp-finder-scripts @ git+https://github.com/gwisp2/stamp-finder-scripts.git#4ab8b66afe6f09bf628d3ccb52803c799ecb7b34"
    ],
    extras_require={
        "dev": [
            "black",
            "isort",
            "mypy"
        ],
        "tests": ["pytest"],
    },
    entry_points={"console_scripts": ["sfb=sfb.main:main"]},
)
