"""
Usage:
  sfb -c CONFIG_FILE [--log-sfs]
"""
import sys
import threading
import time
from pathlib import Path, PurePath
from typing import List

import docopt

from sfb import subprocess_util
from sfb.config import Config
from sfb.flask_app import FlaskApp
from sfb.shops_updater import ShopsUpdater
from sfb.stamps_updater import StampsUpdater


class Sfb:
    def __init__(self, config_base_dir: PurePath, config: Config):
        self.config = config

        self.internal_dir_path = Path(config_base_dir.joinpath(config.internal_dir))
        self.public_data_dir = Path(config_base_dir.joinpath(config.public_dir))

        stamps_db_path = Path(self.internal_dir_path.joinpath("stamps-data"))
        self.stamps_updater = StampsUpdater(
            stamps_db_path, config.stamps_data, self.public_data_dir
        )
        shops_data_path = Path(self.internal_dir_path.joinpath("shops-data"))
        self.shops_updater = ShopsUpdater(shops_data_path, self.public_data_dir)

        self.flask_app = FlaskApp(self.shops_updater)

    def init(self):
        # Create internal & public directories, download data if needed
        self.stamps_updater.init()
        self.shops_updater.init()

    def run_updaters(self):
        self.init()

        # regenerate shops.json
        self.shops_updater.update_public()

        while True:
            if self.stamps_updater.update():
                # Scrape available stamps from rusmarka website
                self.shops_updater.update_rusmarka_in_background()

            time.sleep(self.config.stamps_data.refresh_period)

    def run_web_server(self):
        self.flask_app.run()

    def run(self):
        threading.Thread(
            target=self.run_updaters, name="Updaters", daemon=False
        ).start()
        threading.Thread(
            target=self.run_web_server, name="Web server", daemon=False
        ).start()


def main(argv: List[str]):
    options = docopt.docopt(__doc__, argv[1:])

    subprocess_util.sfs_logging_enabled = options["--log-sfs"]

    config_path = Path(options["CONFIG_FILE"])
    config_dir = config_path.parent
    config = Config.load_from_yaml_file(config_path)
    Sfb(config_dir, config).run()


if __name__ == "__main__":
    main(sys.argv)
