import argparse
import datetime
import json
import os
import sys
import progressbar

from .command import Command
from sfs.core import data_fetch
from ..core.items import ShopItems, Item, export_shop_items_to_json


class CommandScanRusmarkaAvailability(Command):
    def __init__(self):
        super().__init__('scan-rusmarka-availability')

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument('--out', type=str, required=True)

    def run(self, args):
        sys.stderr.write('Fetching position page links from rusmarka\n')
        all_position_ids = list(data_fetch.find_all_position_ids())
        sys.stderr.write('Loading all positions & parsing buy offers\n')
        buy_offers_lists = [data_fetch.load_buy_offers(pos_id) for pos_id in progressbar.progressbar(all_position_ids)]
        buy_offers = [bo for l in buy_offers_lists for bo in l]
        shop_items = ShopItems(excel_name='rusmarka.ru', report_date=datetime.datetime.now().date(), items=[
            Item(name='?', ids=bo.stamp_ids, amount=None) for bo in buy_offers
        ])
        js = export_shop_items_to_json(shop_items)
        with open(args.out, 'wt', encoding='utf-8') as f:
            json.dump(js, f, skipkeys=True, indent=2, ensure_ascii=False)
