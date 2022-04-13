import json
import threading
from pathlib import Path
from typing import Dict, List

import filelock
import xxhash

from sf.core import ExtractedShopItems, Shop, ShopMetadata, log
from sf.tasks import TaskShopsScrape


class ShopNotUpdatedException(Exception):
    def __init__(self, message: str):
        super().__init__()
        self.message = message


class ShopsUpdater:
    def __init__(self, internal_shops_dir: Path, public_dir: Path):
        self.internal_shops_dir = internal_shops_dir
        self.public_dir = public_dir
        self.rusmarka_json_path = self.internal_shops_dir.joinpath("shop_rusmarka.json")
        self.rusmarka_json_tmp_path = self.internal_shops_dir.joinpath(
            "tmp_shop_rusmarka.json"
        )
        self.rusmarka_lock = threading.RLock()
        self.shops_json_lock = filelock.FileLock(
            self.internal_shops_dir.joinpath(".lock")
        )

    def init(self):
        self.internal_shops_dir.mkdir(parents=True, exist_ok=True)
        self.public_dir.mkdir(parents=True, exist_ok=True)
        if not self.has_rusmarka_data():
            self.update_rusmarka_in_background()

    def update_public(self):
        """Regenerate shops.json based on known data"""

        with self.shops_json_lock.acquire():
            # Load data about shops
            item_lists = list(self._load_shops().values())
            metadata_list = self._load_metadata()
            excel_names_with_metadata = {m.excel_name for m in metadata_list}

            # Generate metadata if missing
            for shop_items in item_lists:
                if shop_items.excel_name not in excel_names_with_metadata:
                    name = (
                        shop_items.excel_name.removeprefix("Филиал")
                        .strip()
                        .removeprefix("г.")
                        .strip()
                    )
                    metadata_list.append(
                        ShopMetadata(
                            excel_name=shop_items.excel_name,
                            metadata={
                                "id": xxhash.xxh32(
                                    shop_items.excel_name.encode("utf8")
                                ).hexdigest(),
                                "displayName": name,
                            },
                        )
                    )

            shops: List[Shop] = Shop.combine(item_lists, metadata_list)
            shop_dicts = [s.to_json() for s in shops]
            self.public_dir.joinpath("shops.json").write_text(
                json.dumps(shop_dicts, indent=2, ensure_ascii=False), encoding="utf8"
            )

        log.info("Regenerated shops.json")

    def handle_shop_quantities_xls(self, file_content: bytes):
        # Parse xls
        extracted_items = ExtractedShopItems.parse_from_xls(file_content)
        if extracted_items is None:
            raise ShopNotUpdatedException("Не удалось извлечь данные из файла")

        with self.shops_json_lock.acquire():
            # Load old files & check if provided data is not too old
            shops_dict = self._load_shops()
            old_items = next(
                (
                    s
                    for s in shops_dict.values()
                    if s.excel_name == extracted_items.excel_name
                ),
                None,
            )
            if (
                old_items is not None
                and old_items.report_date >= extracted_items.report_date
            ):
                raise ShopNotUpdatedException("Нужны более свежие данные")

            # Update file
            shop_json_path = self._find_shop_file_path(
                shops_dict, extracted_items.excel_name
            )
            shop_json_path.write_text(
                json.dumps(extracted_items.to_json()), encoding="utf8"
            )
            self.update_public()

    def _find_shop_file_path(
        self, shops_dict: Dict[str, ExtractedShopItems], excel_name: str
    ) -> Path:
        f = next(
            (
                filename
                for filename, shop in shops_dict.items()
                if shop.excel_name == excel_name
            ),
            None,
        )
        if f is None:
            # Use default name
            f = "shop_" + xxhash.xxh32(excel_name.encode("utf8")).hexdigest() + ".json"
        return self.internal_shops_dir.joinpath(f)

    def _load_metadata(self) -> List[ShopMetadata]:
        metadata_path = self.internal_shops_dir.joinpath("metadata.json")
        if metadata_path.exists():
            return ShopMetadata.from_json_list(
                json.loads(
                    self.internal_shops_dir.joinpath("metadata.json").read_text("utf8")
                )
            )
        else:
            return ShopMetadata.get_bundled_list()

    def _load_shops(self) -> Dict[str, ExtractedShopItems]:
        return {
            str(p.name): ExtractedShopItems.from_json(json.loads(p.read_text("utf8")))
            for p in self.internal_shops_dir.glob("shop_*.json")
        }

    def has_rusmarka_data(self) -> bool:
        return self.rusmarka_json_path.exists()

    def update_rusmarka_in_background(self):
        threading.Thread(target=self._update_rusmarka, daemon=True).start()

    def _update_rusmarka(self):
        if not self.rusmarka_lock.acquire(blocking=False):
            # Already updating, exit
            return

        # Scrape
        log.info("Started scraping rusmarka")
        try:
            TaskShopsScrape(self.rusmarka_json_tmp_path).run()
            log.info("Completed scraping rusmarka")
        finally:
            self.rusmarka_lock.release()

        # Update
        with self.shops_json_lock.acquire():
            self.rusmarka_json_tmp_path.replace(self.rusmarka_json_path)
            self.update_public()
