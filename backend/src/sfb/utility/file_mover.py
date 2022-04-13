import os
import re
import shutil
from collections import OrderedDict
from pathlib import Path
from typing import Callable

FileOrder = Callable[[Path], int]


def re_file_order(pattern_dict: OrderedDict[re.Pattern, int]):
    def get_order(path: Path) -> int:
        for k, v in pattern_dict.items():
            if k.match(str(path.name)) is not None:
                return v
        return 0

    return get_order


def move_contents(src: Path, dst: Path, order: FileOrder):
    src_files_and_dirs = list(src.rglob("*"))
    src_files = [f for f in src_files_and_dirs if f.is_file()]
    src_dirs = [f for f in src_files_and_dirs if f.is_dir()]
    src_files.sort(key=order)

    # Create directories
    for src_file in src_dirs:
        # Create the same directory in dst
        dst_file = dst.joinpath(src_file.relative_to(src))
        dst_file.mkdir(parents=True, exist_ok=True)

    # Move files
    for src_file in src_files:
        os.replace(src_file, dst.joinpath(src_file.relative_to(src)))

    # Delete other files
    for e in dst.rglob("*"):
        if Path(src.joinpath(e.relative_to(dst))) not in src_files_and_dirs:
            # Delete
            if e.is_dir():
                shutil.rmtree(e)
            else:
                os.remove(e)
