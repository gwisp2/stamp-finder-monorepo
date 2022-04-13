from typing import Any, Dict, List, Type, TypeVar


class Task:
    command_name: List[str] = []
    docopt_line: str = ""

    @classmethod
    def parse_docopt_dict(cls, docopt_dict: Dict[str, Any]) -> "Task":
        ...

    def run(self):
        pass


UnknownTask = TypeVar("UnknownTask", bound=Task)
UnknownTaskType = Type[UnknownTask]
