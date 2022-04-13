import os
import time
from pathlib import Path

from sfb.config import Config
from sfb.shops_updater import ShopsUpdater
from sfb.stamps_updater import StampsUpdater

ENV_CONFIG_PATH = "SFB_CONFIG_PATH"


class SfbCore:
    def __init__(self, config_file_path: Path):
        config_dir = config_file_path.parent
        self.config = Config.load_from_yaml_file(config_file_path)

        self.internal_dir_path = Path(config_dir.joinpath(self.config.internal_dir))
        self.public_data_dir = Path(config_dir.joinpath(self.config.public_dir))

        stamps_db_path = Path(self.internal_dir_path.joinpath("stamps-data"))
        self.stamps_updater = StampsUpdater(
            stamps_db_path, self.config.stamps_data, self.public_data_dir
        )
        shops_data_path = Path(self.internal_dir_path.joinpath("shops-data"))
        self.shops_updater = ShopsUpdater(shops_data_path, self.public_data_dir)

    def do_initial_setup(self):
        # Create internal & public directories, download data if needed
        self.stamps_updater.init()
        self.stamps_updater.update_public()
        self.shops_updater.init()
        self.shops_updater.update_public()

    def run_update_loop(self):
        while True:
            self._update_stamps_from_upstream()
            time.sleep(self.config.stamps_data.refresh_period)

    def upload_shop_quantities_file(self, content: bytes):
        self.shops_updater.handle_shop_quantities_xls(content)

    def _update_stamps_from_upstream(self):
        if self.stamps_updater.update():
            self.shops_updater.update_rusmarka_in_background()

    @staticmethod
    def create() -> "SfbCore":
        config_file = os.environ.get(ENV_CONFIG_PATH, None)
        if config_file is None:
            raise RuntimeError(f"{ENV_CONFIG_PATH} environment variable is not defined")
        return SfbCore(Path(config_file))
