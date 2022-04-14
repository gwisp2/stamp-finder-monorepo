import datetime
import json
from pathlib import Path
from typing import Any, Dict

from sf.core import ExtractedShopItems, ShopItem, data_fetch, log
from sf.tasks.task import Task


class TaskShopsScrape(Task):
    command_name = ["shops", "scrape"]
    docopt_line: str = "--out=<json_file>"

    def __init__(self, out: Path):
        self.out = out

    @classmethod
    def parse_docopt_dict(cls, args: Dict[str, Any]) -> "Task":
        out = Path(args["--out"])
        return TaskShopsScrape(out)

    def run(self):
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
                ShopItem(name=bo.name, ids=bo.stamp_ids, amount=None)
                for bo in buy_offers
                if bo.typ == "Чистый"
            ],
        )
        js = shop_items.to_json()
        with open(self.out, "wt", encoding="utf-8") as f:
            json.dump(js, f, skipkeys=True, indent=2, ensure_ascii=False)
