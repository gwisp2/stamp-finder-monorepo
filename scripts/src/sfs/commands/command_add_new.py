import argparse
import io
import os
import sys
from argparse import Namespace

import progressbar
import requests
from PIL import Image

from . import CommandUpdateCats
from .command import Command
from ..core import data_fetch, StampsJson, PositionPageParser
from ..core.stamps_data import StampEntry


class CommandAddNew(Command):
    def __init__(self):
        super().__init__("add-new")

    def configure_parser(self, parser: argparse.ArgumentParser):
        parser.add_argument("--datadir", type=str, required=True)
        parser.add_argument("--links-page", type=str, required=True)

    def run(self, args):
        stamps_json_path = os.path.join(args.datadir, "stamps.json")
        sys.stderr.write("Loading stamps.json\n")
        stamps_json = StampsJson.load(stamps_json_path)

        sys.stderr.write("Fetching links\n")
        position_ids_at_page = set(data_fetch.fetch_position_ids(args.links_page))
        known_position_ids = set(e.position_id() for e in stamps_json.entries)
        known_stamp_ids = set(e.id for e in stamps_json.entries)

        position_ids_to_add = position_ids_at_page - known_position_ids
        if len(position_ids_to_add) == 0:
            sys.stderr.write("No new positions\n")
            return

        sys.stderr.write(f"New position ids: {position_ids_to_add}\n")

        for position_id in progressbar.progressbar(position_ids_to_add):
            content = data_fetch.load_position_page(position_id)
            stamps_info = PositionPageParser.parse_stamp_entries(content)
            for stamp_info in stamps_info:
                if stamp_info.id not in known_stamp_ids:
                    if stamp_info.image_url is not None:
                        image_path = f"images/{stamp_info.id}.png"
                        sys.stderr.write(
                            f"Loading {image_path} from {stamp_info.image_url}\n"
                        )
                        image = Image.open(
                            io.BytesIO(requests.get(stamp_info.image_url).content)
                        ).convert("RGB")
                        image.save(os.path.join(args.datadir, image_path))
                    else:
                        image_path = None

                    stamps_json.add_entry(
                        StampEntry(
                            id=stamp_info.id,
                            value=float(stamp_info.value or 0.0),
                            year=stamp_info.year,
                            page=data_fetch.position_page_url(position_id),
                            categories=[],
                            name=stamp_info.name,
                            series=stamp_info.series,
                            image=image_path,
                        )
                    )

        sys.stderr.write("Saving stamps.json\n")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)

        sys.stderr.write("Updating categories\n")
        CommandUpdateCats().run(Namespace(datadir=args.datadir))
