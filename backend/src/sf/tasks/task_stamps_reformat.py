import os
from pathlib import Path
from typing import Any, Dict

from sf.core import StampsJson, log
from sf.tasks.task import Task


class TaskStampsReformat(Task):
    command_name = ["stamps", "reformat"]
    docopt_line = "--db=<db>"

    def __init__(self, db: Path):
        self.db = db

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        return TaskStampsReformat(Path(args["--db"]))

    def run(self):
        stamps_json_path = os.path.join(self.db, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        log.info("Saving stamps.json")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)
