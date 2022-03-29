import json

from sfs.core import ExtractedShopItems, log

from .command import Command


class CmdShopsParseXls(Command):
    name = ["shops", "parse-xls"]

    def run(self):
        in_file = self.args["<xls_file>"]
        out_file = self.args["--out"]

        with open(in_file, "rb") as f:
            extracted_items = ExtractedShopItems.parse_from_xls(f.read())
        if not extracted_items:
            log.info("Couldn't parse a shop")
            return
        js = extracted_items.to_json()
        with open(out_file, "wt", encoding="utf-8") as f:
            json.dump(js, f, skipkeys=True, indent=2, ensure_ascii=False)
