import datetime
import re
import bs4
from decimal import Decimal
from typing import Union, Optional, List, Tuple, Dict
from dataclasses import dataclass


class ParseException(Exception):
    pass


class Section:
    def __str__(self):
        return '%s(%s)' % (
            type(self).__name__,
            ', '.join('%s=%s' % item for item in vars(self).items())
        )

    def __repr__(self):
        return self.__str__()


class SectionHeader(Section):
    def __init__(self, text: str, stamp_id_or_range: Optional[Union[int, Tuple[int, int]]]):
        self.text = text
        self.stamp_id_or_range = stamp_id_or_range


class SectionDateOrAuthor(Section):
    def __init__(self, date: Optional[datetime.date]):
        self.date = date


class SectionDescription(Section):
    pass


class BuyOffer(Section):
    def __init__(self, ids: List[int], typ: str, price: Decimal):
        self.ids = ids
        self.typ = typ
        self.price = price


class SectionImageAndOffers(Section):
    def __init__(self, image_url: str, buy_offers: List[BuyOffer]):
        self.image_url = image_url
        self.buy_offers = buy_offers


@dataclass
class StampBaseInfo:
    id: int
    image_url: Optional[str] = None
    value: Optional[Decimal] = None
    year: Optional[int] = None
    present: Optional[bool] = None


class PositionPageParser:
    @staticmethod
    def parse_stamp_entries(content: Union[str, bytes, List[Section]]) -> List[StampBaseInfo]:
        if isinstance(content, str) or isinstance(content, bytes):
            content = PositionPageParser.parse_sections(content)
        stamps_dict: Dict[int, StampBaseInfo] = {}
        year = None

        def info(stamp_id: int) -> StampBaseInfo:
            if stamp_id in stamps_dict:
                return stamps_dict[stamp_id]
            else:
                stamps_dict[stamp_id] = StampBaseInfo(id=stamp_id)
                return stamps_dict[stamp_id]

        last_id = None
        for section in content:
            if isinstance(section, SectionHeader):
                if section.stamp_id_or_range is not None:
                    if isinstance(section.stamp_id_or_range, int):
                        info(section.stamp_id_or_range)
                        last_id = section.stamp_id_or_range
                    else:
                        for x in range(section.stamp_id_or_range[0], section.stamp_id_or_range[1] + 1):
                            info(x)
            elif isinstance(section, SectionDateOrAuthor):
                if section.date:
                    year = section.date.year
            elif isinstance(section, SectionImageAndOffers):
                if last_id:
                    if info(last_id).image_url is None:
                        info(last_id).image_url = section.image_url
                    if info(last_id).value is None:
                        buy_offer = next((o for o in section.buy_offers if o.ids == [last_id] and o.typ == 'Чистый'), None)
                        if buy_offer is not None:
                            info(last_id).value = buy_offer.price
                            info(last_id).present = True
                        else:
                            info(last_id).present = False

        stamps_list = list(stamps_dict.values())
        stamps_list.sort(key=lambda x: x.id)
        for s in stamps_list:
            s.year = year
        return stamps_list

    @staticmethod
    def parse_sections(content: Union[str, bytes]) -> List[Section]:
        # Parse content into bs4 document
        soup = bs4.BeautifulSoup(content, features="html.parser")
        # Find div with information about stamp
        marka_main_divs = soup.find_all('div', class_='marka-main')
        if len(marka_main_divs) < 2:
            raise ParseException("There must be at least two div.marka-main")
        marka_main_div = marka_main_divs[1]
        # Traverse this div
        sections = []
        for section_element in marka_main_div:
            if not isinstance(section_element, bs4.element.Tag):
                continue
            section_element_class = section_element.attrs.get("class") or []
            h = section_element.find('h1') or section_element.find('h2')
            date_product = section_element.find('div', class_='date-product')
            author_product = section_element.find('div', class_='author-product')
            img = section_element.find('img')
            nav_ul = section_element.find('ul', class_='nav')
            if h:
                # Header
                if '№' not in h.text:
                    # No stamps ids here
                    sections.append(SectionHeader(h.text, None))
                else:
                    # Parse stamp ids
                    id_range_match = re.search(r'^№\s*(\d+)А?-(\d+)А?([\s.]\s*.*$|$)', h.text.strip())
                    id_match = re.search(r'^№\s*(\d+)([\s.]\s*.*$|$)', h.text.strip())
                    if id_range_match:
                        stamp_id_start = int(id_range_match.group(1))
                        stamp_id_end = int(id_range_match.group(2))
                        sections.append(SectionHeader(h.text, (stamp_id_start, stamp_id_end)))
                    elif id_match:
                        stamp_id = int(id_match.group(1))
                        sections.append(SectionHeader(h.text, stamp_id))
            elif date_product or author_product:
                # Date or author
                date = None
                if date_product:
                    date = datetime.datetime.strptime(date_product.text.strip(), '%d.%m.%Y').date()
                sections.append(SectionDateOrAuthor(date))
            elif "section-catalog" in section_element_class:
                # List of other stamps, ignore this
                pass
            elif 'nav-other-item' in section_element_class:
                # Prev & next link
                # Stop parsing here
                return sections
            elif img:
                # Extract image url
                image_url = img.attrs.get('data-zoom-image') or img.attrs.get('src')
                if image_url is None:
                    raise ParseException("No image source")
                image_url = 'https://rusmarka.ru/' + image_url

                # Extract buy offers
                tbody = section_element.find('tbody')
                buy_offers = []
                if tbody:
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
                            raise ParseException(f"Can't parse price: '{price}'")
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
                            buy_offers.append(BuyOffer(buy_option_ids, typ, price))

                sections.append(SectionImageAndOffers(image_url, buy_offers))
            elif nav_ul:
                sections.append(SectionDescription())
            elif section_element.name == 'h3' and section_element.text == 'С этим покупают':
                # List of other stamps, ignore this
                pass
            else:
                # Unknown section, ignore
                pass

        return sections
