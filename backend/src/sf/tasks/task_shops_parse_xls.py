import json
from pathlib import Path
from typing import Any, Dict

from sf.core import ExtractedShopItems, log
from sf.tasks.task import Task


class TaskShopsParseXls(Task):
    command_name = ["shops", "parse-xls"]
    docopt_line: str = "--out=<json_file> <xls_file>"

    def __init__(self, out: Path, xls_file: Path):
        self.out = out
        self.xls_file = xls_file

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        out = Path(args["--out"])
        xls_file = Path(args["<xls_file>"])
        return TaskShopsParseXls(out, xls_file)

    def run(self):
        extracted_items = ExtractedShopItems.parse_from_xls(self.xls_file.read_bytes())
        if not extracted_items:
            log.info("Couldn't parse a shop")
            return
        js = extracted_items.to_json()
        with open(self.out, "wt", encoding="utf-8") as f:
            json.dump(js, f, skipkeys=True, indent=2, ensure_ascii=False)
