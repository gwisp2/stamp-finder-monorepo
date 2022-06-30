from multiprocessing import Pool, cpu_count
from pathlib import Path
from typing import Any, Dict

import cv2

from sf.core import StampsJson, log
from sf.core.stamp_cropper import crop_stamp
from sf.tasks.task import Task


def crop_task(input_file: str) -> (str, bool):
    image = cv2.imread(input_file)
    crop_result = crop_stamp(image)
    if crop_result.crop_rect is not None:
        cv2.imwrite(input_file, crop_result.result)
        return input_file, True
    else:
        return input_file, False


class TaskImagesCrop(Task):
    command_name = ["images", "crop"]
    docopt_line: str = "--db=<db>"

    def __init__(self, db: Path):
        self.db = db

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        db = Path(args["--db"])
        return TaskImagesCrop(Path(db))

    def run(self):
        # Read stamps.json
        stamps_json_path = self.db.joinpath("stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        # Crop each image
        stamp_image_paths = [
            str(self.db.joinpath(s.image)) for s in stamps_json.entries if s.image
        ]
        with Pool(cpu_count()) as p:
            for image_path, was_cropped in log.progressbar(
                p.imap_unordered(crop_task, stamp_image_paths)
            ):
                if was_cropped:
                    log.info("Cropped {}", image_path)
