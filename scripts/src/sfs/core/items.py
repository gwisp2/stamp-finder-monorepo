import dataclasses
import re
from typing import List, Optional, Dict
import datetime

import pyexcel

from .utils import extract_ids


DateFormat = '%d.%m.%Y'


def parse_date(date_str: str) -> datetime.date:
    return datetime.datetime.strptime(date_str, DateFormat).date()


def date_to_str(date: Optional[datetime.date]) -> Optional[str]:
    if date is None:
        return None
    return date.strftime(DateFormat)


@dataclasses.dataclass
class Item:
    name: str
    ids: List[int]
    amount: Optional[int]


@dataclasses.dataclass
class ShopItems:
    excel_name: str
    report_date: datetime.date
    items: List[Item]


@dataclasses.dataclass
class ShopMetadata:
    excel_name: str
    metadata: Dict


@dataclasses.dataclass
class Shop:
    excel_name: str
    report_date: Optional[datetime.date]
    metadata: Dict
    items: List[Item]


def parse_shop_from_xls(filename: str) -> Optional[ShopItems]:
    rows = pyexcel.get_array(file_name=filename)
    excel_name = None
    report_date = None
    items: List[Item] = []

    for row in rows:
        row_without_empty_columns = [str(c).strip() for c in row if str(c).strip()]
        item_type = 'Марки России почтовые (негашенные)'
        if len(row_without_empty_columns) == 2 and row_without_empty_columns[0].startswith('Филиал'):
            excel_name = row_without_empty_columns[0].strip()
        elif len(row_without_empty_columns) == 4 and row_without_empty_columns[2] == item_type:
            name = row_without_empty_columns[1]
            amount = row_without_empty_columns[3]
            ids = extract_ids(name)
            if ids:
                items.append(Item(name, ids, int(amount)))
        elif len(row_without_empty_columns) == 2 and row_without_empty_columns[1].startswith('Период: '):
            date_str = re.search(r'\d+.\d+.\d+', row_without_empty_columns[1]).group(0)
            report_date = parse_date(date_str)

    if excel_name and report_date and items:
        return ShopItems(excel_name, report_date, items)


def combine_list_of_shop_items_with_metadata(l_items: List[ShopItems], metadata_list: List[ShopMetadata]) -> List[Shop]:
    report_date_by_excel_name = {i.excel_name: i.report_date for i in l_items}
    items_by_excel_name = {i.excel_name: i.items for i in l_items}
    shops = []
    for metadata in metadata_list:
        report_date = report_date_by_excel_name.get(metadata.excel_name) or None
        items = items_by_excel_name.get(metadata.excel_name) or []
        shops.append(Shop(metadata.excel_name, report_date, metadata.metadata, items))
    return shops


def extract_metadata(shop_root) -> Dict:
    dict_copy = dict(shop_root)
    del dict_copy["excelName"]
    return dict_copy


def parse_shops_metadata_from_json(root) -> List[ShopMetadata]:
    return [ShopMetadata(s["excelName"], extract_metadata(s)) for s in root]


def parse_shop_items_from_json(root) -> ShopItems:
    return ShopItems(
        root["excelName"],
        parse_date(root["reportDate"]),
        [Item(**item_json) for item_json in root["items"]]
    )


def export_shop_items_to_json(shop: ShopItems):
    return {
        'excelName': shop.excel_name,
        'reportDate': date_to_str(shop.report_date),
        'items': [item.__dict__ for item in shop.items]
    }


def export_shops_to_json(shops: List[Shop]):
    return [
        {
            'excelName': s.excel_name,
            'reportDate': date_to_str(s.report_date),
            **s.metadata,
            'items': [item.__dict__ for item in s.items]
        } for s in shops
    ]
