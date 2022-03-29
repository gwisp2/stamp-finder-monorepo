import argparse
import json
import sys

from sfs.core.items import parse_shop_from_xls, export_shop_items_to_json
from .command import Command


class CommandExtractItems(Command):
    def __init__(self):
        super().__init__("extract-items")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("infile", type=str)
        parser.add_argument("outfile", type=str)

    def run(self, args):
        shop = parse_shop_from_xls(args.infile)
        if not shop:
            sys.stderr.write("Couldn't parse a shop\n")
            return
        js = export_shop_items_to_json(shop)
        with open(args.outfile, "wt", encoding="utf-8") as f:
            json.dump(js, f, skipkeys=True, indent=2, ensure_ascii=False)
