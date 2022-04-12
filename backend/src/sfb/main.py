"""
Usage:
  sfb -c CONFIG_FILE [--log-sfs]
"""
import sys
import time
from pathlib import Path, PurePath
from typing import List

import docopt
from loguru import logger

from sfb import subprocess_util
from sfb.config import Config
from sfb.git_repository import GitRepository
from sfb.shops_updater import ShopsUpdater
from sfb.subprocess_util import run_sfs


class Sfb:
    def __init__(self, config_base_dir: PurePath, config: Config):
        self.config = config

        self.internal_dir_path = Path(config_base_dir.joinpath(config.internal_dir))
        self.public_data_dir = Path(config_base_dir.joinpath(config.public_dir))

        self.stamps_data_path = Path(self.internal_dir_path.joinpath("stamps-data"))
        self.stamps_data_repo = GitRepository(
            config.stamps_data.git, config.stamps_data.git_ref, self.stamps_data_path
        )

        shops_data_path = Path(self.internal_dir_path.joinpath("shops-data"))
        self.shops_updater = ShopsUpdater(shops_data_path, self.public_data_dir)

    def init_directories(self):
        # Create internal & public directories if not exist
        self.internal_dir_path.mkdir(parents=True, exist_ok=True)
        self.public_data_dir.mkdir(parents=True, exist_ok=True)
        self.stamps_data_repo.ensure_cloned()

    def init_stamps_data(self):
        if not self.stamps_data_repo.ensure_cloned():
            # Was already cloned
            logger.info("Found data in {}", self.stamps_data_path)

    def update_public_stamps_data(self):
        # Update images
        run_sfs(
            [
                "images",
                "build",
                f"--dst-db={self.public_data_dir}",
                f"--src-db={self.stamps_data_path}",
                "--size=512",
            ]
        )
        logger.info("Updated public data")

    def run(self):
        self.init_directories()
        self.init_stamps_data()

        self.update_public_stamps_data()
        self.shops_updater.update_public()

        if not self.shops_updater.has_rusmarka_data():
            self.shops_updater.update_rusmarka_in_background()

        while True:
            if self.stamps_data_repo.update():
                # Regenerate public data
                logger.info("Received new stamps data from git")
                self.update_public_stamps_data()
                self.shops_updater.update_rusmarka_in_background()

            time.sleep(self.config.stamps_data.refresh_period)


def main(argv: List[str]):
    options = docopt.docopt(__doc__, argv[1:])

    subprocess_util.sfs_logging_enabled = options["--log-sfs"]

    config_path = Path(options["CONFIG_FILE"])
    config_dir = config_path.parent
    config = Config.load_from_yaml_file(config_path)
    Sfb(config_dir, config).run()


if __name__ == "__main__":
    main(sys.argv)
