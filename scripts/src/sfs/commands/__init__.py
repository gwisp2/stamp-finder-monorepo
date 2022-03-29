from sfs.commands.command import Command

from .command_add_new import CommandAddNew
from .command_extract_items import CommandExtractItems
from .command_reformat import CommandReformat
from .command_rename_images import CommandRenameImages
from .command_resize_images import CommandResizeImages
from .command_scan_rusmarka_availability import CommandScanRusmarkaAvailability
from .command_union_items import CommandUnionItems
from .command_update_cats import CommandUpdateCats

command_list = [
    CommandResizeImages(),
    CommandUpdateCats(),
    CommandAddNew(),
    CommandReformat(),
    CommandRenameImages(),
    CommandExtractItems(),
    CommandUnionItems(),
    CommandScanRusmarkaAvailability(),
]
