#!/usr/bin/env python3
from setuptools import find_packages, setup

REQUIREMENTS = [i.strip() for i in open("requirements.txt").readlines() if len(i.strip()) != 0]

setup(
    name="stamp-finder-backend",
    version="0.0.1",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    install_requires=REQUIREMENTS,
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
