import sys
from typing import Any, Dict, Iterable, List, Union

from loguru import logger

from .implementation import LogImplementation, T


class ServerLogImplementation(LogImplementation):
    def apply(self):
        logger.remove()
        logger.add(
            sys.stdout, format="{level} | <level>{message}</level>", colorize=True
        )

    def log(
        self, level: Union[str, int], message: str, *args: Any, **kwargs: Any
    ) -> None:
        logger.log(level, message, *args, **kwargs)

    def progressbar(self, iterable: Iterable[T], *args, **kwargs) -> Iterable[T]:
        return iterable
