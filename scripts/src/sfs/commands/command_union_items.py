import argparse
import json

from sfs.core.items import (
    combine_list_of_shop_items_with_metadata,
    export_shops_to_json,
    parse_shop_items_from_json,
    parse_shops_metadata_from_json,
)

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
            shops_metadata = parse_shops_metadata_from_json(json.load(f))
        shop_items_list = []
        for infile in args.infiles:
            with open(infile, "rt", encoding="utf-8") as f:
                shop_items_list.append(parse_shop_items_from_json(json.load(f)))
        shops = combine_list_of_shop_items_with_metadata(
            shop_items_list, shops_metadata
        )
        with open(args.outfile, "wt", encoding="utf-8") as f:
            shops_json = export_shops_to_json(shops)
            json.dump(shops_json, f, indent=2, ensure_ascii=False)
