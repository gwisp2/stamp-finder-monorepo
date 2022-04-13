import importlib.resources
import json
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional

import sf.core.data
from sf.core import ExtractedShopItems, Shop, ShopMetadata, log
from sf.tasks.task import Task


class TaskShopsJoin(Task):
    command_name = ["shops", "join"]
    docopt_line: str = (
        "--out=<json_file> [--metadata=<json_file>] [<input_json_file>]..."
    )

    def __init__(
        self, out_path: Path, metadata_path: Optional[Path], inputs: List[Path]
    ):
        self.out_path = out_path
        self.inputs = inputs
        self.metadata_path = metadata_path

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        out_file = args["--out"]
        metadata_path = args["--metadata"]
        input_files = args["<input_json_file>"]
        return TaskShopsJoin(out_file, metadata_path, input_files)

    def run(self):
        if self.metadata_path:
            # Read metadata from file
            with open(self.metadata_path, "rt", encoding="utf-8") as f:
                shops_metadata = ShopMetadata.from_json_list(json.load(f))
        else:
            # Read bundled metadata
            shops_metadata = ShopMetadata.get_bundled_list()

        shop_items_list = []
        for infile in self.inputs:
            with open(infile, "rt", encoding="utf-8") as f:
                shop_items_list.append(ExtractedShopItems.from_json(json.load(f)))

        shops: List[Shop] = Shop.combine(shop_items_list, shops_metadata)
        with open(self.out_path, "wt", encoding="utf-8") as f:
            shops_json = [shop.to_json() for shop in shops]
            json.dump(shops_json, f, indent=2, ensure_ascii=False)

        log.info("Completed")
