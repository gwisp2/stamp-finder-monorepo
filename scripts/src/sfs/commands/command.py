from typing import Any, List, Union, Dict


class Command:
    # Overridden in subclasses
    name: Union[str, List[str]] = ""

    def __init__(self, args: Dict[Any, Any]):
        self.args: Dict[Any, Any] = args

    @classmethod
    def name_as_list(cls) -> List[str]:
        return cls.name if isinstance(cls.name, list) else [cls.name]

    def run(self):
        raise NotImplemented
