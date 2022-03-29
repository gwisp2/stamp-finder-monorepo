import argparse
import os
import sys

import itertools
import progressbar

from .command import Command
from ..core import data_fetch, StampsJson


class CommandUpdateCats(Command):
    def __init__(self):
        super().__init__("update-cats")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        sys.stderr.write("Loading stamps.json\n")
        stamps_json = StampsJson.load(stamps_json_path)

        all_entries = list(stamps_json.entries)
        all_entries.sort(key=lambda e: e.position_id())
        pos_id_to_stamps = {
            pos_id: list(stamps_iter)
            for pos_id, stamps_iter in itertools.groupby(
                all_entries, lambda e: e.position_id()
            )
        }

        for stamp in all_entries:
            stamp.categories = []

        sys.stderr.write("Fetching data\n")
        cats_dict = data_fetch.find_categories()
        for cat_id, cat_name in progressbar.progressbar(cats_dict.items()):
            if cat_name == "Новинки":
                continue
            pos_ids = data_fetch.find_position_ids_for_category(cat_id)
            for pos_id in pos_ids:
                for stamp in pos_id_to_stamps.get(pos_id) or []:
                    stamp.categories.append(cat_name)

        sys.stderr.write("Saving stamps.json\n")
        stamps_json.save(stamps_json_path)
