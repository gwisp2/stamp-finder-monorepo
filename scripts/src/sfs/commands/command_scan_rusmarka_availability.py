import argparse
import datetime
import json

from sfs.core import ExtractedShopItems, ShopItem, data_fetch, log

from .command import Command


class CommandScanRusmarkaAvailability(Command):
    def __init__(self):
        super().__init__("scan-rusmarka-availability")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--out", type=str, required=True)

    def run(self, args):
        log.info("Fetching position page links from rusmarka")
        all_position_ids = list(data_fetch.find_all_position_ids())
        log.info("Loading all positions & parsing buy offers")
        buy_offers_lists = [
            data_fetch.load_buy_offers(pos_id)
            for pos_id in log.progressbar(all_position_ids)
        ]
        buy_offers = [
            bo for offers_on_page in buy_offers_lists for bo in offers_on_page
        ]
        shop_items = ExtractedShopItems(
            excel_name="rusmarka.ru",
            report_date=datetime.datetime.now().date(),
            items=[
                ShopItem(name="?", ids=bo.stamp_ids, amount=None) for bo in buy_offers
            ],
        )
        js = shop_items.to_json()
        with open(args.out, "wt", encoding="utf-8") as f:
            json.dump(js, f, skipkeys=True, indent=2, ensure_ascii=False)
