from pathlib import Path

from loguru import logger

from sfb.config import ConfigDataRepo
from sfb.git_repository import GitRepository
from sfb.subprocess_util import run_sfs


class StampsUpdater:
    def __init__(
        self,
        internal_stamps_db_dir: Path,
        upstream_config: ConfigDataRepo,
        public_dir: Path,
    ):
        self.internal_stamps_db_dir = internal_stamps_db_dir
        self.upstream_config = upstream_config
        self.public_dir = public_dir
        self.stamps_data_repo = GitRepository(
            upstream_config.git, upstream_config.git_ref, internal_stamps_db_dir
        )

    def init(self):
        self.internal_stamps_db_dir.mkdir(parents=True, exist_ok=True)
        self.public_dir.mkdir(parents=True, exist_ok=True)
        if not self.stamps_data_repo.ensure_cloned():
            # Was already cloned
            logger.info("Found existing data in {}", self.internal_stamps_db_dir)

    def update_public(self):
        """Update images in public directory that is intended to be distributed by the webserver"""

        run_sfs(
            [
                "images",
                "build",
                f"--dst-db={self.public_dir}",
                f"--src-db={self.internal_stamps_db_dir}",
                "--size=512",
            ]
        )
        logger.info("Updated public data")

    def update(self) -> bool:
        """Update internal from upstream"""

        if self.stamps_data_repo.update():
            # Regenerate public data
            logger.info("Received new stamps data from git")
            self.update_public()
            return True
        return False
