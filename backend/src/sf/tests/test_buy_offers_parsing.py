import importlib.resources
from decimal import Decimal
from typing import Dict, List

import pytest

import sf.tests.pages
from sf.core import BuyOffer

expected_values_dict: Dict[str, List[BuyOffer]] = {
    "38182.html": [
        BuyOffer(stamp_ids=[2741], name="2741", typ="Чистый", price=Decimal("56.00")),
        BuyOffer(stamp_ids=[2742], name="2742", typ="Чистый", price=Decimal("56.00")),
        BuyOffer(stamp_ids=[2743], name="2743", typ="Чистый", price=Decimal("56.00")),
        BuyOffer(stamp_ids=[2743], name="г2743", typ="Гашеный", price=Decimal("17.00")),
        BuyOffer(stamp_ids=[2744], name="2744", typ="Чистый", price=Decimal("56.00")),
        BuyOffer(stamp_ids=[2744], name="г2744", typ="Гашеный", price=Decimal("17.00")),
        BuyOffer(
            stamp_ids=[2741, 2742, 2743, 2744],
            name="2741-2744",
            typ="Чистый",
            price=Decimal("448.00"),
        ),
    ],
    "38205.html": [
        BuyOffer(stamp_ids=[2746], name="2746", typ="Чистый", price=Decimal("30.00")),
        BuyOffer(stamp_ids=[2746], name="2746", typ="Чистый", price=Decimal("360.00")),
        BuyOffer(stamp_ids=[2747], name="2747", typ="Чистый", price=Decimal("30.00")),
        BuyOffer(stamp_ids=[2747], name="г2747", typ="Гашеный", price=Decimal("11.00")),
        BuyOffer(stamp_ids=[2747], name="2747", typ="Чистый", price=Decimal("360.00")),
        BuyOffer(stamp_ids=[2748], name="2748", typ="Чистый", price=Decimal("30.00")),
        BuyOffer(stamp_ids=[2748], name="г2748", typ="Гашеный", price=Decimal("11.00")),
        BuyOffer(stamp_ids=[2748], name="2748", typ="Чистый", price=Decimal("360.00")),
        BuyOffer(stamp_ids=[2749], name="2749", typ="Чистый", price=Decimal("30.00")),
        BuyOffer(stamp_ids=[2749], name="г2749", typ="Гашеный", price=Decimal("11.00")),
        BuyOffer(stamp_ids=[2749], name="2749", typ="Чистый", price=Decimal("360.00")),
    ],
    "38226.html": [
        BuyOffer(
            stamp_ids=[2753], name="2753 блок", typ="Чистый", price=Decimal("100.00")
        ),
        BuyOffer(
            stamp_ids=[2753], name="г2753 блок", typ="Гашеный", price=Decimal("73.00")
        ),
    ],
    "38617.html": [],
    "38063.html": [
        BuyOffer(stamp_ids=[2726], name="г2726", typ="Гашеный", price=Decimal("24.00")),
        BuyOffer(stamp_ids=[2727], name="г2727", typ="Гашеный", price=Decimal("24.00")),
        BuyOffer(stamp_ids=[2728], name="г2728", typ="Гашеный", price=Decimal("24.00")),
        BuyOffer(stamp_ids=[2729], name="г2729", typ="Гашеный", price=Decimal("24.00")),
    ],
    "39566.html": [
        BuyOffer(stamp_ids=[2881], name="2881", typ="Чистый", price=Decimal("50.00")),
        BuyOffer(stamp_ids=[2881], name="г2881", typ="Гашеный", price=Decimal("17.00")),
        BuyOffer(stamp_ids=[2881], name="2881", typ="Чистый", price=Decimal("350.00")),
    ],
}
page_name_list = [k for k, v in expected_values_dict.items()]


@pytest.mark.parametrize("page_name", page_name_list)
def test_parse_buy_offers(page_name: str):
    content = importlib.resources.read_binary(sf.tests.pages, page_name)
    buy_offers = BuyOffer.extract_from_page(content)
    assert buy_offers == expected_values_dict[page_name]
