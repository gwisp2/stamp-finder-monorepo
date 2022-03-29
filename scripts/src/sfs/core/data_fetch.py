import re
from typing import Dict, List, Set, cast

import bs4
import requests
from bs4 import Tag

from . import BuyOffer, log


def fetch_position_ids(page_url: str) -> List[int]:
    s = bs4.BeautifulSoup(requests.get(page_url).content, features="html.parser")
    matches = [
        re.search(r"/catalog/marki/position/(\d+).aspx", link.attrs["href"])
        for link in s.find_all("a")
    ]
    return [int(m.group(1)) for m in matches if m]


def find_all_position_ids() -> Set[int]:
    # Find max page index
    max_page_index = 0
    url = f"https://rusmarka.ru/catalog/marki/year/0/p/0.aspx"
    soup = bs4.BeautifulSoup(requests.get(url).content, features="html.parser")
    for a in soup.find_all("a", class_="page-link"):
        m = re.match(r"/catalog/marki/year/0/p/(\d+).aspx", a["href"])
        if m:
            max_page_index = max(max_page_index, int(m.group(1)))

    # Visit all pages
    position_ids_lists = [
        fetch_position_ids(f"https://rusmarka.ru/catalog/marki/year/0/p/{page}.aspx")
        for page in log.tqdm(range(0, max_page_index + 1))
    ]
    return set(i for pos_id_list in position_ids_lists for i in pos_id_list)


def find_categories() -> Dict[int, str]:
    soup = bs4.BeautifulSoup(
        requests.get("https://rusmarka.ru/catalog/marki/year/0.aspx").content,
        features="html.parser",
    )
    category_select = cast(Tag, soup.find("select", attrs={"name": "category"}))
    d = {}
    for option in category_select.find_all("option"):
        val = option["value"]
        text = option.text
        if len(val) != 0:
            d[int(val)] = text
    return d


def find_position_ids_for_category(cat_id: int) -> Set[int]:
    # Find max page index
    max_page_index = 0
    url = f"https://rusmarka.ru/catalog/marki/year/0/cat/{cat_id}/p/0.aspx"
    soup = bs4.BeautifulSoup(requests.get(url).content, features="html.parser")
    for a in soup.find_all("a", class_="page-link"):
        m = re.match(
            r"/catalog/marki/year/0/cat/" + str(cat_id) + r"/p/(\d+).aspx", a["href"]
        )
        if m:
            max_page_index = max(max_page_index, int(m.group(1)))

    # Visit all pages
    position_ids_lists = [
        fetch_position_ids(
            f"https://rusmarka.ru/catalog/marki/year/0/cat/{cat_id}/p/{page}.aspx"
        )
        for page in log.tqdm(
            range(0, max_page_index + 1), desc=f"Category {cat_id}", leave=False
        )
    ]
    return set(i for pos_id_list in position_ids_lists for i in pos_id_list)


def position_page_url(position_id: int) -> str:
    return f"https://rusmarka.ru/catalog/marki/position/{position_id}.aspx"


def load_position_page(position_id: int) -> bytes:
    return requests.get(position_page_url(position_id)).content


def load_buy_offers(position_id: int) -> List[BuyOffer]:
    return BuyOffer.extract_from_page(load_position_page(position_id))
