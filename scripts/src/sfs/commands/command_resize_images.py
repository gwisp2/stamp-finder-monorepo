import argparse
import os

from PIL import Image

from .command import Command
from ..core import log


class CommandResizeImages(Command):
    def __init__(self):
        super().__init__("resize-images")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)
        parser.add_argument("--size", type=int, required=True)

    def run(self, args):
        log.info("Scanning images directory & resizing\n")
        images_dir = os.path.join(args.datadir, "images")
        image_files = os.listdir(images_dir)
        for image_file in image_files:
            full_path = os.path.join(images_dir, image_file)
            im = Image.open(full_path)
            im.thumbnail((args.size, args.size))
            im.save(full_path)
