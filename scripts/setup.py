#!/usr/bin/env python3
from setuptools import find_packages, setup

setup(
    name="stamp-finder-scripts",
    version="0.0.1",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    package_data={
        "": ["*.json"],
    },
    install_requires=[
        "requests",
        "bs4",
        "docopt",
        "xxhash",
        "tqdm",
        "pillow",
        "pydantic",
        "pyexcel-xls",
        "pyexcel>=0.6.7",
    ],
    extras_require={
        "dev": [
            "black",
            "isort",
            "mypy",
            "types-requests",
            "types-beautifulsoup4",
            "types-Pillow",
            "tqdm-stubs",
            "types-xxhash",
            "types-docopt",
        ],
        "tests": ["pytest"],
    },
    entry_points={"console_scripts": ["sfs=sfs.main:main"]},
)
