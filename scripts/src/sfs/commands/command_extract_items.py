import argparse
import json

from sfs.core import ExtractedShopItems, log

from .command import Command


class CommandExtractItems(Command):
    def __init__(self):
        super().__init__("extract-items")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("infile", type=str)
        parser.add_argument("outfile", type=str)

    def run(self, args):
        with open(args.infile, "rb") as f:
            extracted_items = ExtractedShopItems.parse_from_xls(f.read())
        if not extracted_items:
            log.info("Couldn't parse a shop")
            return
        js = extracted_items.to_json()
        with open(args.outfile, "wt", encoding="utf-8") as f:
            json.dump(js, f, skipkeys=True, indent=2, ensure_ascii=False)
