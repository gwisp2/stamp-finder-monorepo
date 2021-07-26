from .command_resize_images import CommandResizeImages
from .command_update_image_field import CommandUpdateImageField
from .command_update_present_field import CommandUpdatePresentField
from .command_update_cats import CommandUpdateCats
from .command_add_new import CommandAddNew
from .command_reformat import CommandReformat
from .command_parse_names import CommandParseNames

command_list = [
    CommandUpdatePresentField(),
    CommandUpdateImageField(),
    CommandResizeImages(),
    CommandUpdateCats(),
    CommandAddNew(),
    CommandReformat(),
    CommandParseNames()
]
