import os

from PIL import Image

from sfs.core import log

from .command import Command


class CmdImagesResize(Command):
    name = ["images", "resize"]

    def run(self):
        db_path = self.args["--db"]
        size = int(self.args["--size"])

        log.info("Scanning images directory & resizing")
        images_dir = os.path.join(db_path, "images")
        image_files = os.listdir(images_dir)
        for image_file in log.progressbar(image_files):
            full_path = os.path.join(images_dir, image_file)
            im = Image.open(full_path)
            if im.width > size or im.height > size:
                log.info(f"Resizing {image_file}")
                im.thumbnail((size, size))
                im.save(full_path)
