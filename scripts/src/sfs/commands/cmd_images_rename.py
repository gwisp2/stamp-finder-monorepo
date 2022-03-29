import os

from sfs.core import StampsJson, log

from .command import Command


class CmdImagesRename(Command):
    name = ["images", "rename"]

    def run(self):
        db_path = self.args["--db"]
        file_format = self.args["--format"]

        stamps_json_path = os.path.join(db_path, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        log.info("Renaming images")
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
            new_basename = file_format.format(
                basename=basename, filename=filename, ext=extension
            )
            renames[path] = os.path.join(path_dir, new_basename).replace("\\", "/")
            os.rename(
                os.path.join(stamps_json_dir, path),
                os.path.join(stamps_json_dir, path_dir, new_basename),
            )

        for stamp in stamps_json.entries:
            stamp.image = renames[stamp.image]

        log.info("Saving stamps.json")
        stamps_json.save(stamps_json_path)
