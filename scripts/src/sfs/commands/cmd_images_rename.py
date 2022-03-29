import os
import re

import xxhash

from sfs.core import StampsJson, log

from .command import Command


class CmdImagesRename(Command):
    name = ["images", "rename"]

    def run(self):
        db_path = self.args["--db"]

        stamps_json_path = os.path.join(db_path, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        log.info("Renaming images")
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
                # Image is already renamed
                renames[path] = path
                continue

            with open(abs_path, "rb") as f:
                hasher = xxhash.xxh32()
                hasher.update(f.read())
                file_hash = hasher.hexdigest()

            new_basename = f"{filename}-{file_hash}.{extension}"
            renames[path] = os.path.join(path_dir, new_basename).replace("\\", "/")
            os.rename(
                abs_path,
                os.path.join(stamps_json_dir, path_dir, new_basename),
            )

        for stamp in stamps_json.entries:
            stamp.image = renames[stamp.image]

        log.info("Saving stamps.json")
        stamps_json.save(stamps_json_path)
