import argparse
import os
import sys

from .command import Command
from ..core import StampsJson, PositionPageParser


class CommandParseNames(Command):
    def __init__(self):
        super().__init__("parse-names")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)
        parser.add_argument("--pagesdir", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        sys.stderr.write("Loading stamps.json\n")
        stamps_json = StampsJson.load(stamps_json_path)
        entry_dict = stamps_json.entry_dict()

        sys.stderr.write("Parsing pages\n")
        for d in os.listdir(args.pagesdir):
            with open(os.path.join(args.pagesdir, d), "rb") as f:
                content = f.read()
            try:
                stamps = PositionPageParser.parse_stamp_entries(content)
            except:
                # Ignore any parsing errors
                continue
            for stamp in stamps:
                if stamp.id in entry_dict:
                    entry_dict[stamp.id].name = entry_dict[stamp.id].name or (
                        stamp.name if stamp.name and len(stamp.name) >= 6 else None
                    )
                    entry_dict[stamp.id].series = (
                        entry_dict[stamp.id].series or stamp.series
                    )

        sys.stderr.write("Saving stamps.json\n")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)
