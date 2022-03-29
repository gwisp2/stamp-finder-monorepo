from decimal import Decimal
from typing import List

import bs4
from pydantic import BaseModel

from sfs.core.utils import extract_ids


class BuyOffer(BaseModel):
    stamp_ids: List[int]
    typ: str
    price: Decimal


def extract_buy_offers(page_content: bytes) -> List[BuyOffer]:
    # Note that parsing buy offers is not included in PositionPageParser.
    # PositionPageParser is aimed to work only with new pages, it may crash on old ones.
    # So we can't use PositionPageParser here.
    soup = bs4.BeautifulSoup(page_content, features="html.parser")
    options: List[BuyOffer] = []
    for table_container in soup.find_all("div", class_="marka-post"):
        tbody = table_container.find("tbody")
        if not tbody:
            continue
        rows = tbody.find_all("tr")
        last_art = None
        for row in rows:
            cells = [td.text for td in row.find_all("td")]
            cells = [c if c != "\xa0" else None for c in cells]
            art_cell = cells[0]
            art = art_cell or last_art
            last_art = art
            typ = cells[1]
            price = cells[2]
            if price:
                price = price.replace("\xa0", " ").replace(",", ".")
            if price and price.endswith("руб."):
                price = Decimal(price[:-4].strip())
            elif price is None:
                price = None
            else:
                raise RuntimeError(f"Can't parse price: '{price}'")
            if art is not None and typ is not None and price is not None:
                buy_option_ids = extract_ids(art)
                if not buy_option_ids:
                    continue
                options.append(BuyOffer(stamp_ids=buy_option_ids, typ=typ, price=price))
    return options
