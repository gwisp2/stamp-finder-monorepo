import glob
import io
import os
import re
import shutil
from typing import Dict, Tuple

import xxhash
from docopt import Optional
from PIL import Image

from sfs.core import StampEntry, StampsJson, log

from .command import Command


class CmdImagesBuild(Command):
    name = ["images", "build"]

    def run(self):
        db_path = self.args["--db"]
        cache_db_path = self.args["--cache-db"]
        size = int(self.args["--size"] or 512)

        if cache_db_path == db_path:
            raise RuntimeError("cache_db_path and db_path must be different")

        # Read stamps.json
        stamps_json_path = os.path.join(db_path, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)
        stamps_json_image_to_entry = {e.image: e for e in stamps_json.entries}

        # Read cache & find what image names can be mapped
        if cache_db_path is not None and os.path.exists(
            os.path.join(cache_db_path, "stamps.json")
        ):
            log.info("Loading cache stamps.json")
            cache_stamps_json = StampsJson.load(
                os.path.join(cache_db_path, "stamps.json")
            )

            # Keys: image name (without extension & -{hash} suffix)
            # Values: (name with hash and extension, absolute path, mtime)
            image_to_cache_image_path: Dict[str, (str, str, float)] = {}

            for entry in cache_stamps_json.entries:
                if not os.path.exists(os.path.join(cache_db_path, entry.image)):
                    # Ignore invalid image paths
                    continue

                basename = os.path.basename(entry.image)
                filename = basename.split(".")[0]
                m = re.match("^(.*)-([0-9a-f]{8})$", filename)
                if m:
                    abs_path = os.path.join(cache_db_path, entry.image)
                    mtime = os.stat(abs_path).st_mtime
                    image_to_cache_image_path[m.group(1)] = (basename, abs_path, mtime)

        else:
            image_to_cache_image_path = {}

        # Compress images
        log.info("Compressing images")
        image_paths = {
            stamp.image for stamp in stamps_json.entries if stamp.image is not None
        }
        renames = {}
        for path in log.progressbar(image_paths):
            abs_path = os.path.join(db_path, path)

            path_dir = os.path.dirname(path)
            basename = os.path.basename(path)

            filename = basename.split(".")[0]
            extension = basename.split(".")[1]

            m = re.match("^(.*)-([0-9a-f]{8})$", filename)
            if m:
                # Image is already compressed
                renames[path] = path
                continue

            cache_entry = image_to_cache_image_path.get(filename)
            if cache_entry is not None and cache_entry[2] == os.stat(abs_path).st_mtime:
                # Found compressed image in cache, with the same mtime
                # Add a rename & copy file
                new_path = os.path.join(path_dir, cache_entry[0]).replace("\\", "/")
                renames[path] = new_path
                shutil.copy2(cache_entry[1], os.path.join(db_path, new_path))
                # Remove old file
                os.remove(abs_path)
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
            new_abs_path = os.path.join(db_path, path_dir, new_basename)
            with open(new_abs_path, "wb") as f:
                f.write(compressed_bytes)

            # Copy mtime from original file, so that next time we can skip compression if mtimes match
            os.utime(
                new_abs_path,
                (os.path.getatime(new_abs_path), os.path.getmtime(abs_path)),
            )

            renames[path] = os.path.join(path_dir, new_basename).replace("\\", "/")

            # Remove old file
            os.remove(abs_path)

        for stamp in stamps_json.entries:
            stamp.image = renames[stamp.image]

        log.info("Saving stamps.json")
        stamps_json.save(stamps_json_path)
