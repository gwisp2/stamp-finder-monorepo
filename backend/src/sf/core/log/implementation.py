from abc import ABC, abstractmethod
from typing import Any, Dict, Iterable, List, TypeVar, Union

T = TypeVar("T")


class LogImplementation(ABC):
    @abstractmethod
    def apply(self):
        ...

    @abstractmethod
    def log(
        self, level: Union[str, int], message: str, *args: Any, **kwargs: Any
    ) -> None:
        ...

    @abstractmethod
    def progressbar(self, iterable: Iterable[T], *args, **kwargs) -> Iterable[T]:
        ...
