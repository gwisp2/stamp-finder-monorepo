from pathlib import Path
from typing import Any, Dict

from pydantic import BaseModel
from yaml import Loader, load


class ConfigDataRepo(BaseModel):
    git: str
    git_ref: str
    refresh_period: int


class Config(BaseModel):
    internal_dir: str
    public_dir: str
    stamps_data: ConfigDataRepo

    @staticmethod
    def load_from_dict(config_dict: Dict[Any, Any]) -> "Config":
        return Config(**config_dict)

    @staticmethod
    def load_from_yaml_bytes(content: bytes) -> "Config":
        yaml_dict = load(content, Loader=Loader)
        return Config.load_from_dict(yaml_dict)

    @staticmethod
    def load_from_yaml_file(path: Path):
        with open(path, "rb") as f:
            return Config.load_from_yaml_bytes(f.read())
