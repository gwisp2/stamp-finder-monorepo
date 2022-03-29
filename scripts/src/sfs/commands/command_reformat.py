import argparse
import os
import sys

from sfs.core import StampsJson

from .command import Command


class CommandReformat(Command):
    def __init__(self):
        super().__init__("reformat")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        sys.stderr.write("Loading stamps.json\n")
        stamps_json = StampsJson.load(stamps_json_path)

        sys.stderr.write("Saving stamps.json\n")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)
