import json
import re
from dataclasses import dataclass
from os import PathLike
from pathlib import Path
from typing import List, Optional, Union


@dataclass
class StampEntry:
    id: int
    image: Optional[str]
    value: float
    year: int
    page: str
    categories: List[str]
    series: Optional[str] = None
    name: Optional[str] = None

    def position_id(self) -> int:
        m = re.search(r"(\d+)", self.page)
        if m:
            return int(m.group(1))
        else:
            raise RuntimeError(f"Can't find position id in {self.page}")


class StampsJson:
    def __init__(self, entries: List[StampEntry]):
        self.entries = entries

    def add_entry(self, entry: StampEntry):
        self.entries.append(entry)

    def sort_entries(self):
        self.entries.sort(key=lambda e: e.id)

    @staticmethod
    def load(path) -> "StampsJson":
        entries: List[StampEntry] = []
        with open(path, "rt", encoding="utf-8") as f:
            entries_json = json.load(f)
        for k in entries_json:
            entry_json = entries_json[k]
            entries.append(
                StampEntry(
                    id=int(k),
                    image=entry_json["image"],
                    value=float(entry_json["value"]),
                    year=int(entry_json["year"]),
                    page=entry_json["page"],
                    categories=entry_json.get("categories") or [],
                    series=entry_json.get("series"),
                    name=entry_json.get("name"),
                )
            )
        return StampsJson(entries)

    def save(self, path: Union[str, PathLike]):
        path = Path(path)
        entries_dict = {}
        for entry in self.entries:
            entries_dict[entry.id] = {
                "image": entry.image,
                "value": entry.value,
                "year": entry.year,
                "page": entry.page,
                "categories": entry.categories,
                "series": entry.series,
                "name": entry.name,
            }
        with open(path, "wt", encoding="utf-8") as f:
            json.dump(entries_dict, f, indent=2, ensure_ascii=False)
