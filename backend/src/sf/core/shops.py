import datetime
import importlib.resources
import json
import re
from io import BytesIO
from typing import Any, Dict, List, Optional

import pyexcel
from pydantic import BaseModel

import sf.core.data

from .utils import extract_ids


class DateFormat:
    def __init__(self, format: str):
        self.format = format

    def parse(self, date_str: str) -> Optional[datetime.date]:
        try:
            return datetime.datetime.strptime(date_str, self.format).date()
        except ValueError:
            return None

    def to_str(self, date: Optional[datetime.date]) -> Optional[str]:
        if date is None:
            return None
        return date.strftime(self.format)


report_date_format = DateFormat("%d.%m.%Y")
json_date_format = DateFormat("%d.%m.%Y")


# Position that is sold in a shop, consists from a list of stamps
class ShopItem(BaseModel):
    name: str
    ids: List[int]
    amount: Optional[int]


# Shop items extracted from rusmarka website of from .xls
class ExtractedShopItems(BaseModel):
    excel_name: str
    report_date: datetime.date
    items: List[ShopItem]

    @staticmethod
    def parse_from_xls(file_content: bytes) -> Optional["ExtractedShopItems"]:
        # Load .xls file
        rows = pyexcel.get_array(file_content=file_content, file_type="xls")

        excel_name = None
        report_date = None
        items: List[ShopItem] = []

        for row in rows:
            # Remove empty cells from row & strip cells data
            row = [str(c).strip() for c in row if str(c).strip()]

            item_type = "Марки России почтовые (негашенные)"
            if len(row) == 2 and row[0].startswith("Филиал"):
                # Name row
                excel_name = row[0].strip()
            elif len(row) == 4 and row[2] == item_type:
                # Item row
                name = row[1]
                amount = row[3]
                ids = extract_ids(name)
                if ids:
                    items.append(ShopItem(name=name, ids=ids, amount=int(amount)))
            elif len(row) == 2 and row[1].startswith("Период: "):
                # Period raw
                date_matches = re.findall(r"\d+.\d+.\d+", row[1])
                if date_matches:
                    date_str = date_matches[-1]
                    report_date = report_date_format.parse(date_str)

        if excel_name and report_date and items:
            return ExtractedShopItems(
                excel_name=excel_name, report_date=report_date, items=items
            )
        else:
            return None

    @staticmethod
    def from_json(j: Any) -> "ExtractedShopItems":
        return ExtractedShopItems(
            excel_name=j["excelName"],
            report_date=json_date_format.parse(j["reportDate"]),
            items=[ShopItem(**item_json) for item_json in j["items"]],
        )

    def to_json(self) -> Any:
        return {
            "excelName": self.excel_name,
            "reportDate": json_date_format.to_str(self.report_date),
            "items": [item.__dict__ for item in self.items],
        }


# Shop metadata
class ShopMetadata(BaseModel):
    excel_name: str
    metadata: Dict[Any, Any]

    @staticmethod
    def from_json(j: Any) -> "ShopMetadata":
        metadata_dict = dict(j)
        del metadata_dict["excelName"]

        return ShopMetadata(excel_name=j["excelName"], metadata=metadata_dict)

    @staticmethod
    def from_json_list(jl: List[Any]) -> List["ShopMetadata"]:
        return [ShopMetadata.from_json(j) for j in jl]

    @staticmethod
    def get_bundled_list() -> List["ShopMetadata"]:
        metadata_bytes = importlib.resources.read_binary(
            sf.core.data, "default-shops-metadata.json"
        )
        return ShopMetadata.from_json_list(json.load(BytesIO(metadata_bytes)))


# Combined ExtractedShopItems & ShopMetadata
class Shop(BaseModel):
    excel_name: str
    report_date: Optional[datetime.date]
    metadata: Dict[Any, Any]
    items: List[ShopItem]

    @staticmethod
    def combine(
        extracted_items: List[ExtractedShopItems], shops_metadata: List[ShopMetadata]
    ) -> List["Shop"]:
        report_date_by_excel_name = {
            i.excel_name: i.report_date for i in extracted_items
        }
        items_by_excel_name = {i.excel_name: i.items for i in extracted_items}
        shops: List[Shop] = []
        for metadata in shops_metadata:
            report_date = report_date_by_excel_name.get(metadata.excel_name) or None
            items = items_by_excel_name.get(metadata.excel_name) or []
            shops.append(
                Shop(
                    excel_name=metadata.excel_name,
                    report_date=report_date,
                    metadata=metadata.metadata,
                    items=items,
                )
            )
        return shops

    def to_json(self) -> Any:
        return {
            "excelName": self.excel_name,
            "reportDate": json_date_format.to_str(self.report_date),
            **self.metadata,
            "items": [item.__dict__ for item in self.items],
        }
