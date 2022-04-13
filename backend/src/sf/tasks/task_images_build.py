import io
import json
import os
from pathlib import Path, PurePath
from typing import Any, Dict, List, Set

import xxhash
from PIL import Image
from pydantic import BaseModel

from sf.core import StampsJson, log
from sf.tasks.task import Task


class DbTransformedFile(BaseModel):
    # Path to original image (relative to db root)
    original_path: Path
    # Path to compressed & hashed (relative to db root)
    transformed_path: Path
    # modification time of the original image
    m_time: float


class DbTransformJournal(BaseModel):
    transforms: List[DbTransformedFile]


def json_encoder(x):
    if isinstance(x, PurePath):
        return str(x).replace("\\", "/")
    return x


class TaskImagesBuild(Task):
    command_name = ["images", "build"]
    docopt_line: str = "--src-db=<db> --dst-db=<db> [--size=<size_px>]"

    def __init__(self, src: Path, dst: Path, size: int = 512):
        self.src = src
        self.dst = dst
        self.size = size

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        src = Path(args["--src-db"])
        dst = Path(args["--dst-db"])
        size = int(args["--size"] or 512)
        return TaskImagesBuild(Path(src), Path(dst), size)

    def run(self):
        # Read stamps.json
        stamps_json_path = self.src.joinpath("stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        # Read previous .image-transform.json
        transform_journal_path = self.dst.joinpath(".image-transform.json")
        if self.src != self.dst and transform_journal_path.exists():
            old_journal = DbTransformJournal(
                **json.loads(transform_journal_path.read_text("utf8"))
            )
            old_transforms: Dict[Path, DbTransformedFile] = {
                t.original_path: t for t in old_journal.transforms
            }
        else:
            old_transforms: Dict[Path, DbTransformedFile] = {}

        # Prepare output directories
        image_paths: Set[Path] = {
            Path(stamp.image)
            for stamp in stamps_json.entries
            if stamp.image is not None
        }
        for image_dir in {path.parent for path in image_paths}:
            self.dst.joinpath(image_dir).mkdir(parents=True, exist_ok=True)

        # Compress images
        log.info("Compressing images")

        done_transforms: Dict[Path, DbTransformedFile] = {}

        # Compress images
        for image_rel_path in log.progressbar(image_paths):
            # 'abs' (absolute) here means that path to the db is included
            image_abs_path = self.src.joinpath(image_rel_path)

            image_rel_dir = image_rel_path.parent
            image_basename = image_rel_path.name
            image_filename = image_basename.split(".")[0]

            # Check if image is already transformed
            if image_rel_path in old_transforms:
                old_transform = old_transforms[image_rel_path]
                if old_transform.m_time == os.path.getmtime(image_abs_path):
                    # Already transformed, skip compression
                    done_transforms[old_transform.original_path] = old_transform
                    continue

            # Compress image
            log.info(f"Compressing {image_rel_path}")
            im = Image.open(image_abs_path)
            im.thumbnail((self.size, self.size))
            compressed_bytes_io = io.BytesIO()
            im.save(compressed_bytes_io, format="webp")
            compressed_bytes = compressed_bytes_io.getvalue()

            # Hash the file
            hasher = xxhash.xxh32()
            hasher.update(compressed_bytes)
            file_hash = hasher.hexdigest()

            # Write the file
            new_basename = f"{image_filename}-{file_hash}.webp"
            new_rel_path = image_rel_dir.joinpath(new_basename)
            new_abs_path = self.dst.joinpath(new_rel_path)
            with open(new_abs_path, "wb") as f:
                f.write(compressed_bytes)

            original_m_time = os.path.getmtime(image_abs_path)
            transform = DbTransformedFile(
                original_path=image_rel_path,
                transformed_path=new_rel_path,
                m_time=original_m_time,
            )
            done_transforms[transform.original_path] = transform

            # Remove old file
            if self.src == self.dst:
                os.remove(image_abs_path)

        for stamp in stamps_json.entries:
            stamp.image = str(done_transforms[Path(stamp.image)].transformed_path)

        new_image_paths: Set[Path] = {
            t.transformed_path for t in done_transforms.values()
        }
        old_image_paths: Set[Path] = {
            t.transformed_path for t in old_transforms.values()
        }
        files_to_delete: Set[Path] = old_image_paths - new_image_paths

        log.info("Saving stamps.json")
        stamps_json.save(self.dst.joinpath("stamps.json"))

        if self.src != self.dst and len(files_to_delete) != 0:
            log.info(f"Deleting {len(files_to_delete)} old image files")
            for image_rel_path in files_to_delete:
                os.remove(self.dst.joinpath(image_rel_path))

        log.info("Saving transform journal")
        journal = DbTransformJournal(transforms=list(done_transforms.values()))

        journal_as_json = journal.json(indent=2, encoder=json_encoder)
        transform_journal_path.write_text(journal_as_json, encoding="utf8")

        log.info("Done")
