from sfs.commands.command import Command

from .cmd_images_build import CmdImagesBuild
from .cmd_shops_join import CmdShopsJoin
from .cmd_shops_parse_xls import CmdShopsParseXls
from .cmd_shops_scrape import CmdShopsScrape
from .cmd_stamps_reformat import CmdStampsReformat
from .cmd_stamps_scrape_categories import CmdStampsScrapeCategories
from .cmd_stamps_scrape_new import CmdStampsScrapeNew

command_list = [
    CmdImagesBuild,
    CmdStampsScrapeCategories,
    CmdStampsScrapeNew,
    CmdStampsReformat,
    CmdShopsParseXls,
    CmdShopsJoin,
    CmdShopsScrape,
]
