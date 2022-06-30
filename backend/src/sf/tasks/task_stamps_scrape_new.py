import io
import os
from pathlib import Path
from typing import Any, Dict, Optional

import cv2
import numpy as np
import requests
from PIL import Image

from sf.core import PositionPageParser, StampEntry, StampsJson, data_fetch, log
from sf.core.stamp_cropper import crop_stamp
from sf.tasks.task import Task
from sf.tasks.task_stamps_scrape_categories import TaskStampsScrapeCategories


class TaskStampsScrapeNew(Task):
    command_name = ["stamps", "scrape-new"]
    docopt_line = "--db=<db> [--links-page=<url>]"

    def __init__(self, db: Path, links_page: Optional[str] = None):
        self.db = db
        self.links_page = links_page or "https://rusmarka.ru/catalog/marki/cat/19.aspx"

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        return TaskStampsScrapeNew(Path(args["--db"]), args["--links-page"])

    def run(self):
        stamps_json_path = os.path.join(self.db, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        # Scrape links to position pages
        # Use 'Новинки' category if links_page is not provided
        log.info("Fetching links")
        position_ids_at_page = set(data_fetch.fetch_position_ids(self.links_page))
        known_position_ids = set(e.position_id() for e in stamps_json.entries)
        known_stamp_ids = set(e.id for e in stamps_json.entries)

        position_ids_to_add = position_ids_at_page - known_position_ids
        if len(position_ids_to_add) == 0:
            log.info("No new positions")
            return

        log.info(f"New position ids: {position_ids_to_add}")

        for position_id in log.progressbar(position_ids_to_add):
            content = data_fetch.load_position_page(position_id)
            stamps_info = PositionPageParser.parse_stamp_entries(content)
            for stamp_info in stamps_info:
                if stamp_info.id not in known_stamp_ids:
                    if stamp_info.image_url is not None:
                        image_path = f"images/{stamp_info.id}.png"
                        log.info(f"Loading {image_path} from {stamp_info.image_url}")
                        image = Image.open(
                            io.BytesIO(requests.get(stamp_info.image_url).content)
                        ).convert("RGB")
                        open_cv_image = np.array(image)
                        open_cv_image = open_cv_image[:, :, ::-1].copy()  # RGB -> BGR

                        crop_result = crop_stamp(open_cv_image)
                        for entry in crop_result.log_lines:
                            log.info(f"=> {entry}")

                        cv2.imwrite(
                            os.path.join(self.db, image_path), crop_result.result
                        )
                    else:
                        image_path = None

                    stamps_json.add_entry(
                        StampEntry(
                            id=stamp_info.id,
                            value=float(stamp_info.value or 0.0),
                            year=stamp_info.year,
                            page=data_fetch.position_page_url(position_id),
                            categories=[],
                            name=stamp_info.name,
                            series=stamp_info.series,
                            image=image_path,
                        )
                    )

        log.info("Saving stamps.json")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)

        log.info("Updating categories")
        TaskStampsScrapeCategories(self.db)
