import argparse
import os
import sys

from sfs.core import StampsJson

from .command import Command


class CommandRenameImages(Command):
    def __init__(self):
        super().__init__("rename-images")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)
        parser.add_argument("--format", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        sys.stderr.write("Loading stamps.json\n")
        stamps_json = StampsJson.load(stamps_json_path)

        sys.stderr.write("Renaming images\n")
        stamps_json_dir = os.path.dirname(stamps_json_path)
        image_paths = {
            stamp.image for stamp in stamps_json.entries if stamp.image is not None
        }
        renames = {}
        for path in image_paths:
            path_dir = os.path.dirname(path)
            basename = os.path.basename(path)
            filename = basename.split(".")[0]
            extension = basename.split(".")[1]
            new_basename = args.format.format(
                basename=basename, filename=filename, ext=extension
            )
            renames[path] = os.path.join(path_dir, new_basename).replace("\\", "/")
            os.rename(
                os.path.join(stamps_json_dir, path),
                os.path.join(stamps_json_dir, path_dir, new_basename),
            )

        for stamp in stamps_json.entries:
            stamp.image = renames[stamp.image]

        sys.stderr.write("Saving stamps.json\n")
        stamps_json.save(stamps_json_path)
