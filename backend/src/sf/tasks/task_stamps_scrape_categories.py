import itertools
import os
from pathlib import Path
from typing import Any, Dict

from sf.core import StampsJson, data_fetch, log
from sf.tasks.task import Task


class TaskStampsScrapeCategories(Task):
    command_name = ["stamps", "scrape-categories"]
    docopt_line = "--db=<db>"

    def __init__(self, db: Path):
        self.db = db

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        return TaskStampsScrapeCategories(Path(args["--db"]))

    def run(self):
        stamps_json_path = os.path.join(self.db, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        all_entries = list(stamps_json.entries)
        all_entries.sort(key=lambda e: e.position_id())
        pos_id_to_stamps = {
            pos_id: list(stamps_iter)
            for pos_id, stamps_iter in itertools.groupby(
                all_entries, lambda e: e.position_id()
            )
        }

        for stamp in all_entries:
            stamp.categories = []

        log.info("Fetching data")
        cats_dict = data_fetch.find_categories()
        for cat_id, cat_name in log.progressbar(cats_dict.items(), desc="Categories"):
            if cat_name == "Новинки":
                continue
            pos_ids = data_fetch.find_position_ids_for_category(cat_id)
            for pos_id in pos_ids:
                for stamp in pos_id_to_stamps.get(pos_id) or []:
                    stamp.categories.append(cat_name)

        log.info("Saving stamps.json")
        stamps_json.save(stamps_json_path)
