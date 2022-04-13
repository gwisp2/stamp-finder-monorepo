import datetime
import importlib.resources
from typing import Dict

import pytest

import sf.tests.pages
import sf.tests.xls
from sf.core import ExtractedShopItems, ShopItem

expected_values_dict: Dict[str, ExtractedShopItems] = {
    "sample1.xls": ExtractedShopItems(
        excel_name="Филиал г.Смоленск",
        report_date=datetime.date(2021, 10, 28),
        items=[
            ShopItem(name="1032-1033 сцепка", ids=[1032, 1033], amount=174),
            ShopItem(name="1040", ids=[1040], amount=118),
            ShopItem(name="1045", ids=[1045], amount=4),
        ],
    )
}
file_name_list = [k for k, v in expected_values_dict.items()]


@pytest.mark.parametrize("file_name", file_name_list)
def test_parse_items(file_name: str):
    content = importlib.resources.read_binary(sf.tests.xls, file_name)
    parsed_shop_items = ExtractedShopItems.parse_from_xls(content)
    assert parsed_shop_items == expected_values_dict[file_name]
