from .command_resize_images import CommandResizeImages
from .command_update_image_field import CommandUpdateImageField
from .command_update_present_field import CommandUpdatePresentField

command_list = [
    CommandUpdatePresentField(),
    CommandUpdateImageField(),
    CommandResizeImages()
]
