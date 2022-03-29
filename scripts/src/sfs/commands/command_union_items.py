import argparse
import json
from typing import List

from sfs.core import ExtractedShopItems, Shop, ShopMetadata

from .command import Command


class CommandUnionItems(Command):
    def __init__(self):
        super().__init__("union-items")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--metadata", type=str, required=True)
        parser.add_argument("infiles", nargs="+", type=str)
        parser.add_argument("outfile", type=str)

    def run(self, args):
        with open(args.metadata, "rt", encoding="utf-8") as f:
            shops_metadata = ShopMetadata.from_json_list(json.load(f))

        shop_items_list = []
        for infile in args.infiles:
            with open(infile, "rt", encoding="utf-8") as f:
                shop_items_list.append(ExtractedShopItems.from_json(json.load(f)))

        shops: List[Shop] = Shop.combine(shop_items_list, shops_metadata)
        with open(args.outfile, "wt", encoding="utf-8") as f:
            shops_json = [shop.to_json() for shop in shops]
            json.dump(shops_json, f, indent=2, ensure_ascii=False)
