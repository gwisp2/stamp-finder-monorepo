import importlib.resources
import json
from io import BytesIO
from typing import List

import sfs.core.data
from sfs.core import ExtractedShopItems, Shop, ShopMetadata, log

from .command import Command


class CmdShopsJoin(Command):
    name = ["shops", "join"]

    def run(self):
        metadata_path = self.args["--metadata"]
        input_files = self.args["<input_json_file>"]
        out_file = self.args["--out"]

        if metadata_path:
            # Read metadata from file
            with open(metadata_path, "rt", encoding="utf-8") as f:
                shops_metadata = ShopMetadata.from_json_list(json.load(f))
        else:
            # Read bundled metadata
            metadata_bytes = importlib.resources.read_binary(sfs.core.data, 'default-shops-metadata.json')
            shops_metadata = ShopMetadata.from_json_list(json.load(BytesIO(metadata_bytes)))

        shop_items_list = []
        for infile in input_files:
            with open(infile, "rt", encoding="utf-8") as f:
                shop_items_list.append(ExtractedShopItems.from_json(json.load(f)))

        shops: List[Shop] = Shop.combine(shop_items_list, shops_metadata)
        with open(out_file, "wt", encoding="utf-8") as f:
            shops_json = [shop.to_json() for shop in shops]
            json.dump(shops_json, f, indent=2, ensure_ascii=False)

        log.info('Completed')
