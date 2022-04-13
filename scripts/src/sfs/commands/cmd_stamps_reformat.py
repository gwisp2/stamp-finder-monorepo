import os

from sfs.core import StampsJson, log

from .command import Command


class CmdStampsReformat(Command):
    name = ["stamps", "reformat"]

    def run(self):
        db_path = self.args["--db"]

        stamps_json_path = os.path.join(db_path, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        log.info("Saving stamps.json")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)
