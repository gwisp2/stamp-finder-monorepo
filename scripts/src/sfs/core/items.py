import dataclasses
from typing import List, Optional, Any, Dict
from .utils import extract_ids
import pyexcel


@dataclasses.dataclass
class Item:
    name: str
    ids: List[int]
    amount: Optional[int]


@dataclasses.dataclass
class ShopItems:
    excel_name: str
    items: List[Item]


@dataclasses.dataclass
class ShopMetadata:
    excel_name: str
    metadata: Dict


@dataclasses.dataclass
class Shop:
    excel_name: str
    metadata: Dict
    items: List[Item]


def parse_shop_from_xls(filename: str) -> Optional[ShopItems]:
    rows = pyexcel.get_array(file_name=filename)
    excel_name = None
    items: List[Item] = []

    for row in rows:
        row_without_empty_columns = [str(c).strip() for c in row if str(c).strip()]
        item_type = 'Марки России почтовые (негашенные)'
        if len(row_without_empty_columns) == 2 and row_without_empty_columns[0].startswith('Филиал'):
            excel_name = row_without_empty_columns[0].strip()
        if len(row_without_empty_columns) == 4 and row_without_empty_columns[2] == item_type:
            name = row_without_empty_columns[1]
            amount = row_without_empty_columns[3]
            ids = extract_ids(name)
            if ids:
                items.append(Item(name, ids, int(amount)))

    if excel_name and items:
        return ShopItems(excel_name, items)


def combine_list_of_shop_items_with_metadata(l_items: List[ShopItems], metadata_list: List[ShopMetadata]) -> List[Shop]:
    items_by_excel_name = {i.excel_name: i.items for i in l_items}
    shops = []
    for metadata in metadata_list:
        items = items_by_excel_name.get(metadata.excel_name) or []
        shops.append(Shop(metadata.excel_name, metadata.metadata, items))
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
        [Item(**item_json) for item_json in root["items"]]
    )


def export_shop_items_to_json(shop: ShopItems):
    return {
        'excelName': shop.excel_name,
        'items': [item.__dict__ for item in shop.items]
    }


def export_shops_to_json(shops: List[Shop]):
    return [
        {
            'excelName': s.excel_name,
            **s.metadata,
            'items': [item.__dict__ for item in s.items]
        } for s in shops
    ]
