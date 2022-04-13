import subprocess
from pathlib import Path
from subprocess import PIPE
from typing import List, Union

import sfs.main
from loguru import logger


class SubprocessException(Exception):
    def __init__(self, command: List[str], code: int, out: bytes, err: bytes):
        self.command = command
        self.code = code
        self.out = out
        self.err = err


def run_subprocess(command: List[str], cwd: Union[Path, None] = None) -> bytes:
    """Run a command and return it's output. In case of non-zero return code SubprocessException is thrown."""

    result = subprocess.run(command, stdout=PIPE, stderr=PIPE, cwd=cwd)
    if result.returncode != 0:
        raise SubprocessException(
            command, result.returncode, result.stdout, result.stderr
        )
    return result.stdout


def run_sfs(args):
    result = sfs.main.embedded_main(args, catch_log=True)
    if result.code != 0:
        logger.error(result.out.decode("utf8"))
        raise SubprocessException(
            ["(embedded) sfs"] + args, result.code, result.out, b""
        )
