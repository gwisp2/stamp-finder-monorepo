import re
from dataclasses import dataclass
from decimal import Decimal
from typing import List, Set, Dict
import bs4
import progressbar
import requests


@dataclass
class BuyOffer:
    stamp_ids: List[int]
    typ: str
    price: Decimal


def fetch_position_ids(page_url: str) -> List[int]:
    s = bs4.BeautifulSoup(requests.get(page_url).content, features='html.parser')
    matches = [re.search(r'/catalog/marki/position/(\d+).aspx', link.attrs['href']) for link in s.find_all('a')]
    return [int(m.group(1)) for m in matches if m]


def find_all_position_ids() -> Set[int]:
    # Find max page index
    max_page_index = 0
    url = f'https://rusmarka.ru/catalog/marki/year/0/p/0.aspx'
    soup = bs4.BeautifulSoup(requests.get(url).content, features='html.parser')
    for a in soup.find_all('a', class_="page-link"):
        m = re.match(r'/catalog/marki/year/0/p/(\d+).aspx', a["href"])
        if m:
            max_page_index = max(max_page_index, int(m.group(1)))

    # Visit all pages
    position_ids_lists = [fetch_position_ids(f'https://rusmarka.ru/catalog/marki/year/0/p/{page}.aspx') for
                          page in progressbar.progressbar(range(0, max_page_index + 1))]
    return set(i for pos_id_list in position_ids_lists for i in pos_id_list)


def find_categories() -> Dict[int, str]:
    soup = bs4.BeautifulSoup(requests.get('https://rusmarka.ru/catalog/marki/year/0.aspx').content,
                             features="html.parser")
    category_select = soup.find('select', attrs={'name': 'category'})
    d = {}
    for option in category_select.find_all('option'):
        val = option['value']
        text = option.text
        if len(val) != 0:
            d[int(val)] = text
    return d


def find_position_ids_for_category(cat_id: int) -> Set[int]:
    # Find max page index
    max_page_index = 0
    url = f'https://rusmarka.ru/catalog/marki/year/0/cat/{cat_id}/p/0.aspx'
    soup = bs4.BeautifulSoup(requests.get(url).content, features='html.parser')
    for a in soup.find_all('a', class_="page-link"):
        m = re.match(r'/catalog/marki/year/0/cat/' + str(cat_id) + r'/p/(\d+).aspx', a["href"])
        if m:
            max_page_index = max(max_page_index, int(m.group(1)))

    # Visit all pages
    position_ids_lists = [fetch_position_ids(f'https://rusmarka.ru/catalog/marki/year/0/cat/{cat_id}/p/{page}.aspx')
                          for page in range(0, max_page_index + 1)]
    return set(i for pos_id_list in position_ids_lists for i in pos_id_list)


def position_page_url(position_id: int) -> str:
    return f'https://rusmarka.ru/catalog/marki/position/{position_id}.aspx'


def load_position_page(position_id: int) -> bytes:
    return requests.get(position_page_url(position_id)).content


def load_buy_offers(position_id: int):
    return extract_buy_offers(load_position_page(position_id))


def extract_buy_offers(content: bytes):
    soup = bs4.BeautifulSoup(content, features='html.parser')
    options = []
    for table_container in soup.find_all('div', class_='marka-post'):
        tbody = table_container.find('tbody')
        if not tbody:
            continue
        rows = tbody.find_all('tr')
        last_art = None
        for row in rows:
            cells = [td.text for td in row.find_all('td')]
            cells = [c if c != '\xa0' else None for c in cells]
            art_cell = cells[0]
            art = art_cell or last_art
            last_art = art
            typ = cells[1]
            price = cells[2]
            if price:
                price = price.replace('\xa0', ' ').replace(',', '.')
            if price and price.endswith('руб.'):
                price = Decimal(price[:-4].strip())
            elif price is None:
                price = None
            else:
                raise RuntimeError(f"Can't parse price: '{price}'")
            if art is not None and typ is not None and price is not None:
                range_art_match = re.search(r'(\d+)-(\d+)', art)
                single_art_match = re.search(r'(\d+)', art)
                if range_art_match:
                    start_id = int(range_art_match.group(1))
                    end_id = int(range_art_match.group(2))
                    buy_option_ids = list(range(start_id, end_id + 1))
                elif single_art_match:
                    buy_option_ids = [int(single_art_match.group(1))]
                else:
                    continue
                options.append(BuyOffer(buy_option_ids, typ, price))
    return options
