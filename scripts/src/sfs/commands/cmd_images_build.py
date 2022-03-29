import io
import os
import re

import xxhash
from PIL import Image

from sfs.core import StampsJson, log

from .command import Command


class CmdImagesBuild(Command):
    name = ["images", "build"]

    def run(self):
        db_path = self.args["--db"]
        size = int(self.args["--size"] or 512)

        stamps_json_path = os.path.join(db_path, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        log.info("Compressing images")
        stamps_json_dir = os.path.dirname(stamps_json_path)
        image_paths = {
            stamp.image for stamp in stamps_json.entries if stamp.image is not None
        }
        renames = {}
        for path in log.progressbar(image_paths):
            abs_path = os.path.join(stamps_json_dir, path)

            path_dir = os.path.dirname(path)
            basename = os.path.basename(path)

            filename = basename.split(".")[0]
            extension = basename.split(".")[1]

            m = re.match("^(.*)-([0-9a-f]{8})$", filename)
            if m:
                # Image is already compressed
                renames[path] = path
                continue

            # Compress image
            log.info(f"Compressing {path}")
            im = Image.open(abs_path)
            im.thumbnail((size, size))
            compressed_bytes_io = io.BytesIO()
            im.save(compressed_bytes_io, format="webp")
            compressed_bytes = compressed_bytes_io.getvalue()

            # Hash the file
            hasher = xxhash.xxh32()
            hasher.update(compressed_bytes)
            file_hash = hasher.hexdigest()

            # Write the file
            new_basename = f"{filename}-{file_hash}.webp"
            new_abs_path = os.path.join(stamps_json_dir, path_dir, new_basename)
            with open(new_abs_path, "wb") as f:
                f.write(compressed_bytes)

            renames[path] = os.path.join(path_dir, new_basename).replace("\\", "/")

            # Remove old file
            os.remove(abs_path)

        for stamp in stamps_json.entries:
            stamp.image = renames[stamp.image]

        log.info("Saving stamps.json")
        stamps_json.save(stamps_json_path)
