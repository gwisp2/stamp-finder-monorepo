from pathlib import Path

from loguru import logger

from sfb.subprocess_util import run_subprocess


class GitRepository:
    """Control over the cloned git repository"""

    def __init__(self, remote: str, ref: str, local: Path):
        self.remote = remote
        self.ref = ref
        self.local = local

    def ensure_cloned(self) -> bool:
        """
        Ensure that repository is cloned to local directory. The local directory will be created with parent if needed.
        :return: whether it was not already cloned
        """

        # Make sure stamps data is downloaded
        dot_git_dir = self.local.joinpath(".git")

        if dot_git_dir.exists():
            # Already cloned
            self._checkout_ref()
            return False

        # Create directory if not exists
        self.local.mkdir(parents=True, exist_ok=True)

        # Clone git repository
        logger.info("Cloning {} to {}", self.remote, self.local)
        run_subprocess(
            ["git", "clone", self.remote, str(self.local.absolute()),]
        )
        self._checkout_ref()
        return True

    def _checkout_ref(self):
        run_subprocess(["git", "checkout", self.ref], cwd=self.local)

    def update(self) -> bool:
        """
        Run git pull.
        :return: whether git pull changed the current branch
        """
        prev_hash = self.current_commit_hash()
        run_subprocess(["git", "pull"], cwd=self.local)
        new_hash = self.current_commit_hash()
        return new_hash != prev_hash

    def current_commit_hash(self) -> str:
        """:return: the hash of the current git commit"""

        return (
            run_subprocess(["git", "rev-parse", "HEAD"], cwd=self.local)
            .decode("utf8")
            .strip()
        )
