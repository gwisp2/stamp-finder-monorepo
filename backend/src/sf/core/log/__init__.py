from typing import Any, Dict, Iterable, List, Optional, TypeVar

from sf.core.log.cli_log_implementation import CliLogImplementation
from sf.core.log.implementation import LogImplementation


class ImplementationStorage:
    _current: Optional[LogImplementation] = None

    @staticmethod
    def get() -> LogImplementation:
        if ImplementationStorage._current is None:
            return ImplementationStorage.set(CliLogImplementation())
        return ImplementationStorage._current

    @staticmethod
    def set(impl: LogImplementation) -> LogImplementation:
        ImplementationStorage._current = impl
        impl.apply()
        return impl


def info(message: str, *args: Any, **kwargs: Any) -> None:
    ImplementationStorage.get().log("INFO", message, *args, **kwargs)


def warn(message: str, *args: Any, **kwargs: Any) -> None:
    ImplementationStorage.get().log("WARNING", message, *args, **kwargs)


def error(message: str, *args: Any, **kwargs: Any) -> None:
    ImplementationStorage.get().log("ERROR", message, *args, **kwargs)


T = TypeVar("T")


def progressbar(iterable: Iterable[T], *rest_args, **kwargs) -> Iterable[T]:
    return ImplementationStorage.get().progressbar(iterable, *rest_args, **kwargs)
