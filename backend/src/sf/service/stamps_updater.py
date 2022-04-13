from pathlib import Path

from sf.config import ConfigDataRepo
from sf.core import log
from sf.tasks import TaskImagesBuild
from sf.utility.git_repository import GitRepository


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
            upstream_config.url, upstream_config.ref, internal_stamps_db_dir
        )

    def init(self):
        self.internal_stamps_db_dir.mkdir(parents=True, exist_ok=True)
        self.public_dir.mkdir(parents=True, exist_ok=True)
        if not self.stamps_data_repo.ensure_cloned():
            # Was already cloned
            log.info("Found existing data in {}", self.internal_stamps_db_dir)

    def update_public(self):
        """Update images in public directory that is intended to be distributed by the webserver"""
        TaskImagesBuild(self.internal_stamps_db_dir, self.public_dir, size=512).run()
        log.info("Updated public data")

    def update(self) -> bool:
        """Update internal from upstream"""

        if self.stamps_data_repo.update():
            # Regenerate public data
            log.info("Received new stamps data from git")
            self.update_public()
            return True
        return False
