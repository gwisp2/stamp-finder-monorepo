from typing import Any, List, Union


class Command:
    # Overridden in subclasses
    name: Union[str, List[str]] = ""

    def __init__(self, args: dict[Any, Any]):
        self.args: dict[Any, Any] = args

    @classmethod
    def name_as_list(cls) -> List[str]:
        return cls.name if isinstance(cls.name, list) else [cls.name]

    def run(self):
        raise NotImplemented
