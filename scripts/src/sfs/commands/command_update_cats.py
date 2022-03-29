import argparse
import itertools
import os

from sfs.core import StampsJson, data_fetch, log
from .command import Command


class CommandUpdateCats(Command):
    def __init__(self):
        super().__init__("update-cats")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        log.info("Loading stamps.json")
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

        log.info("Fetching data")
        cats_dict = data_fetch.find_categories()
        for cat_id, cat_name in log.progressbar(cats_dict.items()):
            if cat_name == "Новинки":
                continue
            pos_ids = data_fetch.find_position_ids_for_category(cat_id)
            for pos_id in pos_ids:
                for stamp in pos_id_to_stamps.get(pos_id) or []:
                    stamp.categories.append(cat_name)

        log.info("Saving stamps.json")
        stamps_json.save(stamps_json_path)
