import argparse


class Command:
    def __init__(self, name: str):
        self.name = name

    def configure_parser(self, parser: argparse.ArgumentParser):
        raise NotImplemented

    def run(self, args: argparse.Namespace):
        raise NotImplemented
