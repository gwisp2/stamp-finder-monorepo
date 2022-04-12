import io
from abc import ABC, abstractmethod
from typing import Any, Iterable, TypeVar

from tqdm import tqdm


class LogImpl(ABC):
    _current: "LogImpl" = None

    @abstractmethod
    def log(self, message: str) -> None:
        ...

    @abstractmethod
    def progressbar(self, *args, **kwargs) -> Iterable:
        ...

    @staticmethod
    def get() -> "LogImpl":
        if LogImpl._current is None:
            LogImpl._current = DefaultLogImpl()
        return LogImpl._current

    @staticmethod
    def set(impl: "LogImpl") -> None:
        LogImpl._current = impl


class DefaultLogImpl(LogImpl):
    def log(self, message: str) -> None:
        tqdm.write(message)

    def progressbar(self, *args, **kwargs) -> Iterable[Any]:
        return tqdm(*args, **kwargs)


class EmbeddedLogImpl(LogImpl):
    def __init__(self, out: io.IOBase):
        self.out = out

    def log(self, message: str) -> None:
        self.out.write(message.encode("utf8"))
        self.out.write(b"\n")

    def progressbar(self, *args, **kwargs) -> Iterable:
        return args[0]


def info(message: str) -> None:
    LogImpl.get().log(message)


T = TypeVar("T")


def progressbar(iterable: Iterable[T], *rest_args, **kwargs) -> Iterable[T]:
    return LogImpl.get().progressbar(iterable, *rest_args, **kwargs)
