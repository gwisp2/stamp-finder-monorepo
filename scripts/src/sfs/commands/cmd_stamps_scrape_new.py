import io
import os

import requests
from PIL import Image

from sfs.core import PositionPageParser, StampEntry, StampsJson, data_fetch, log

from .cmd_stamps_scrape_categories import CmdStampsScrapeCategories
from .command import Command


class CmdStampsScrapeNew(Command):
    name = ["stamps", "scrape-new"]

    def run(self):
        db_path = self.args["--db"]
        links_page = (
            self.args["--links-page"] or "https://rusmarka.ru/catalog/marki/cat/19.aspx"
        )

        stamps_json_path = os.path.join(db_path, "stamps.json")
        log.info("Loading stamps.json")
        stamps_json = StampsJson.load(stamps_json_path)

        # Scrape links to position pages
        # Use 'Новинки' category if links_page is not provided
        log.info("Fetching links")
        position_ids_at_page = set(data_fetch.fetch_position_ids(links_page))
        known_position_ids = set(e.position_id() for e in stamps_json.entries)
        known_stamp_ids = set(e.id for e in stamps_json.entries)

        position_ids_to_add = position_ids_at_page - known_position_ids
        if len(position_ids_to_add) == 0:
            log.info("No new positions")
            return

        log.info(f"New position ids: {position_ids_to_add}")

        for position_id in log.progressbar(position_ids_to_add):
            content = data_fetch.load_position_page(position_id)
            stamps_info = PositionPageParser.parse_stamp_entries(content)
            for stamp_info in stamps_info:
                if stamp_info.id not in known_stamp_ids:
                    if stamp_info.image_url is not None:
                        image_path = f"images/{stamp_info.id}.png"
                        log.info(f"Loading {image_path} from {stamp_info.image_url}")
                        image = Image.open(
                            io.BytesIO(requests.get(stamp_info.image_url).content)
                        ).convert("RGB")
                        image.save(os.path.join(db_path, image_path))
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

        log.info("Saving stamps.json")
        stamps_json.sort_entries()
        stamps_json.save(stamps_json_path)

        log.info("Updating categories")
        CmdStampsScrapeCategories({"--db": db_path}).run()
