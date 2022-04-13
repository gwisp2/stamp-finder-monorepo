from typing import Any, Dict, Iterable, List, Union

from loguru import logger
from tqdm import tqdm

from .implementation import LogImplementation


class CliLogImplementation(LogImplementation):
    def apply(self):
        logger.remove()
        logger.add(
            lambda m: tqdm.write(m, end=""),
            format="<level>{message}</level>",
            colorize=True,
        )

    def log(
        self, level: Union[str, int], message: str, *args: Any, **kwargs: Any
    ) -> None:
        logger.log(level, message, *args, **kwargs)

    def progressbar(self, *args, **kwargs) -> Iterable[Any]:
        return tqdm(*args, **kwargs)
