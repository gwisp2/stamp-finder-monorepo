#!/usr/bin/env python3
from setuptools import find_packages, setup

REQUIREMENTS = [
    i.strip() for i in open("requirements.txt").readlines() if len(i.strip()) != 0
]

setup(
    name="stamp-finder",
    version="0.0.1",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    package_data={"": ["*.json"],},
    install_requires=REQUIREMENTS,
    extras_require={
        "dev": [
            "black",
            "isort",
            "mypy",
            "tqdm-stubs",
            "types-flask-cors",
            "types-PyYAML",
            "types-Pillow",
            "types-beautifulsoup4",
            "types-docopt",
            "types-requests",
            "types-xxhash",
            "pytest",
        ]
    },
    entry_points={"console_scripts": ["sf=sf.main_cli:main"]},
)
