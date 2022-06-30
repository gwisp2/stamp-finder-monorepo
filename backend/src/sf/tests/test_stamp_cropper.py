import datetime
import importlib.resources
import shutil
from pathlib import Path
from typing import Dict, Union

import cv2
import numpy as np
import pytest

import sf.tests.images
from sf.core.stamp_cropper import Rect, crop_stamp

expected_values_dict: Dict[str, Union[Rect, None]] = {
    "s1.jpg": Rect(min_x=82, min_y=117, width=355, height=498),
    "s2.jpg": Rect(min_x=186, min_y=312, width=768, height=385),
    "s3.jpg": None,
    "s4.jpg": None,
    "s5.jpg": None,
    "s6.jpg": None,
    "s7.jpg": Rect(min_x=549, min_y=135, width=385, height=768),
    "s8.jpg": Rect(min_x=125, min_y=257, width=591, height=438),
    "s9.jpg": None,
    "s10.jpg": Rect(min_x=235, min_y=366, width=591, height=592),
    "s11.jpg": Rect(min_x=251, min_y=569, width=1181, height=874),
}
file_name_list = [k for k, v in expected_values_dict.items()]
base_dir = Path("crop-test")


@pytest.fixture(scope="module", autouse=True)
def prepare():
    if base_dir.exists():
        shutil.rmtree(base_dir)
    base_dir.mkdir(parents=True, exist_ok=True)


@pytest.mark.parametrize("file_name", file_name_list)
def test_crop_image(file_name: str):
    content = importlib.resources.read_binary(sf.tests.images, file_name)
    crop_result = crop_stamp(
        cv2.imdecode(np.frombuffer(content, np.uint8), -1), debug=True
    )

    print(file_name)
    crop_result.print_log()

    file_name_parts = file_name.split(".", 1)
    result_file_name = f"{file_name_parts[0]}-result.png"
    debug_file_name = f"{file_name_parts[0]}-debug.png"

    base_dir = Path("crop-test")

    if crop_result.debug_img is not None:
        save_path = str(base_dir.joinpath(debug_file_name).absolute())
        cv2.imwrite(save_path, crop_result.debug_img)

    if crop_result.result is not None:
        save_path = str(base_dir.joinpath(result_file_name).absolute())
        cv2.imwrite(save_path, crop_result.result)

    expected_rect = expected_values_dict[file_name]
    if expected_rect is None:
        assert crop_result.crop_rect is None
    else:
        max_dev = 3
        assert abs(crop_result.crop_rect.min_x - expected_rect.min_x) <= max_dev
        assert abs(crop_result.crop_rect.max_x - expected_rect.max_x) <= max_dev
        assert abs(crop_result.crop_rect.min_y - expected_rect.min_y) <= max_dev
        assert abs(crop_result.crop_rect.max_y - expected_rect.max_y) <= max_dev
