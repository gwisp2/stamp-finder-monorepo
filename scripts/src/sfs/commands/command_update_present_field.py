import argparse
import os
import sys
import progressbar

from .command import Command
from sfs.core import data_fetch
from sfs.core.stamps_data import StampsJson


class CommandUpdatePresentField(Command):
    def __init__(self):
        super().__init__('update-present-field')

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument('--datadir', type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, 'stamps.json')
        sys.stderr.write('Loading stamps.json\n')
        stamps_json = StampsJson.load(stamps_json_path)
        sys.stderr.write('Fetching position page links from rusmarka\n')
        all_position_ids = data_fetch.find_all_position_ids()
        sys.stderr.write('Loading all positions & parsing buy offers\n')
        buy_offers_lists = [data_fetch.load_buy_offers(pos_id) for pos_id in progressbar.progressbar(all_position_ids)]
        buy_offers = [bo for l in buy_offers_lists for bo in l]
        sys.stderr.write('Updating stamps.json\n')
        present_stamp_ids = set(stamp_id for o in buy_offers if o.typ == 'Чистый' for stamp_id in o.stamp_ids)
        for entry in stamps_json.entries:
            entry.present = (entry.id in present_stamp_ids)
        stamps_json.save(stamps_json_path)
        sys.stderr.write('Looking for new position pages\n')
        known_pages = set(entry.page for entry in stamps_json.entries)
        # Ignore old position ids because some stamps were duplicated on different positions
        new_position_ids = {i for i in all_position_ids if
                            (data_fetch.position_page_url(i) not in known_pages and i > 38226)}
        if len(new_position_ids) != 0:
            sys.stderr.write(f'New position ids: {new_position_ids}\n')
        else:
            sys.stderr.write(f'No new position ids')
