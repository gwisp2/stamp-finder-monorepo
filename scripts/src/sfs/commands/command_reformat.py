import argparse
import os

from sfs.core import StampsJson, log
from .command import Command


class CommandReformat(Command):
    def __init__(self):
        super().__init__("reformat")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        log.info("Saving stamps.json")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)
