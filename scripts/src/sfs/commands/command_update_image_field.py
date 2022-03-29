import argparse
import os
import re
import sys

from .command import Command
from sfs.core import StampsJson


class CommandUpdateImageField(Command):
    def __init__(self):
        super().__init__("update-image-field")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        sys.stderr.write("Loading stamps.json\n")
        stamps_json = StampsJson.load(stamps_json_path)
        sys.stderr.write("Scanning images directory\n")
        images_dir = os.path.join(args.datadir, "images")
        image_files = os.listdir(images_dir)
        id2image = {}
        for image_file in image_files:
            m = re.match(r"(\d+).png", image_file)
            mm = re.match(r"(\d+)-(\d+).png", image_file)
            if m:
                stamp_id = int(m.group(1))
                if stamp_id in id2image:
                    sys.stderr.write(
                        f"Warning: {image_file} duplicates {id2image[stamp_id]} for №{stamp_id}\n"
                    )
                id2image[stamp_id] = f"images/{image_file}"
            elif mm:
                start_id = int(mm.group(1))
                end_id = int(mm.group(2))
                for stamp_id in range(start_id, end_id + 1):
                    if stamp_id in id2image:
                        sys.stderr.write(
                            f"Warning: {image_file} duplicates {id2image[stamp_id]} for №{stamp_id}\n"
                        )
                    id2image[int(stamp_id)] = f"images/{image_file}"
            else:
                sys.stderr.write(f"Warning: unknown file {image_file}\n")
        sys.stderr.write("Updating stamps.json\n")
        for entry in stamps_json.entries:
            entry.image = id2image.get(entry.id)
        stamps_json.save(stamps_json_path)
