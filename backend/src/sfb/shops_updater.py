import threading
from pathlib import Path

from loguru import logger

from sfb.subprocess_util import SubprocessException, run_sfs


class ShopsUpdater:
    def __init__(self, internal_shops_dir: Path, public_dir: Path):
        self.internal_shops_dir = internal_shops_dir
        self.public_dir = public_dir
        self.rusmarka_json_path = self.internal_shops_dir.joinpath("shop_rusmarka.json")
        self.rusmarka_lock = threading.Lock()
        self.shops_json_lock = threading.Lock()

    def update_public(self):
        """Regenerate shops.json based on known data"""

        with self.shops_json_lock:
            self.internal_shops_dir.mkdir(parents=True, exist_ok=True)
            shop_files = [str(p) for p in self.internal_shops_dir.glob("shop_*.json")]
            run_sfs(
                [
                    "shops",
                    "join",
                    f'--out={self.public_dir.joinpath("shops.json")}',
                    *shop_files,
                ]
            )
            logger.info("Regenerated shops.json")

    def has_rusmarka_data(self) -> bool:
        return self.rusmarka_json_path.exists()

    def update_rusmarka_in_background(self):
        threading.Thread(target=self._update_rusmarka, daemon=True).start()

    def _update_rusmarka(self):
        if not self.rusmarka_lock.acquire(blocking=False):
            # Already updating, exit
            return
        logger.info("Started scraping rusmarka")
        try:
            run_sfs(["shops", "scrape", "--out", self.rusmarka_json_path])
            logger.info("Completed scraping rusmarka")
            self.update_public()
        except SubprocessException:
            logger.exception("Exception scraping rusmarka")
        finally:
            self.rusmarka_lock.release()
