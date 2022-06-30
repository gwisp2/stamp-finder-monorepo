from collections import deque
from dataclasses import dataclass, field
from typing import Literal, Union

import cv2
import numpy as np


@dataclass
class Window:
    start: int
    end: int
    points: list[int]

    def __post_init__(self):
        self.median = int(np.median(self.points))
        self.num_points = len(self.points)


@dataclass
class Rect:
    min_x: int
    min_y: int
    width: int
    height: int

    def __post_init__(self):
        self.max_x = self.min_x + self.width - 1
        self.max_y = self.min_y + self.height - 1
        self.center_x = int(self.min_x + self.width / 2)
        self.center_y = int(self.min_y + self.height / 2)


@dataclass
class CropResult:
    result: Union[np.ndarray, None] = None
    crop_rect: Union[Rect, None] = None

    log_lines: list[str] = field(default_factory=lambda: [])
    debug_img: np.ndarray = None

    def print_log(self):
        for line in self.log_lines:
            print(f"=> {line}")

    def log(self, data: str):
        self.log_lines.append(data)


# Finds segments [a, b] where
#   b - a = window_size
#   count of arr elements in a i-th segment is the largest possible without intersection with previous segments
#   each segment contains at leash one point
# Returns
#   list[Window] or list of Nones if desired amount of segments could not be found
# Use-case: find lines with many circles that make up a border around a stamp
def find_most_dense_windows(arr, window_size, num_windows):
    if not arr:
        return [None] * num_windows

    arr = np.sort(np.copy(arr))
    points_in_window = deque()
    count_in_windows = []
    for point in arr:
        window_start = point - window_size
        window_end = point
        # Remove any points that are not in the sliding window anymore
        while points_in_window and points_in_window[0] < window_start:
            points_in_window.popleft()
        # Add point to a window
        points_in_window.append(point)
        count_in_windows.append(len(points_in_window))

    count_in_windows = np.array(count_in_windows)
    windows = []

    while len(windows) < num_windows:
        end_index = np.argmax(count_in_windows)
        if count_in_windows[end_index] == -1:
            return [None] * num_windows

        end = arr[end_index]
        start = end - window_size
        windows.append(
            Window(start=start, end=end, points=arr[(start <= arr) & (arr <= end)])
        )
        count_in_windows[(end - window_size <= arr) & (arr <= end + window_size)] = -1

    return windows


def _crop_stamp(
    source, frame_type: Literal["white", "black"], debug=False
) -> CropResult:
    result = CropResult(result=source)

    img = cv2.cvtColor(source, cv2.COLOR_BGR2GRAY)

    if frame_type == "white":
        _, threshold = cv2.threshold(img, 230, 255, cv2.THRESH_BINARY)
    elif frame_type == "black":
        _, threshold = cv2.threshold(img, 80, 255, cv2.THRESH_BINARY_INV)
    else:
        raise RuntimeError(f"Unknown frame type: {frame_type}")

    _, label_ids, stats, _ = cv2.connectedComponentsWithStats(threshold, 8)

    white_label_ids = set()
    for iy, ix in np.ndindex(label_ids.shape):
        if threshold[iy, ix] == 255:
            white_label_ids.add(label_ids[iy, ix])

    if debug:
        debug_img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        result.debug_img = debug_img

    rects = []
    for label_id in white_label_ids:
        min_x = stats[label_id, cv2.CC_STAT_LEFT]
        min_y = stats[label_id, cv2.CC_STAT_TOP]
        width = stats[label_id, cv2.CC_STAT_WIDTH]
        height = stats[label_id, cv2.CC_STAT_HEIGHT]
        area = stats[label_id, cv2.CC_STAT_AREA]
        rect_area = width * height

        # Circle should have a nearly square bounding rectangle & area of circle is at least 0.7 of rectangle area
        # Also circles around a stamp must not be too small
        if 0.8 <= width / height <= 1.2 and area / rect_area >= 0.7 and area >= 9:
            rects.append(Rect(min_x=min_x, min_y=min_y, width=width, height=height))
            if debug:
                cv2.rectangle(
                    debug_img,
                    (min_x, min_y),
                    (min_x + width, min_y + height),
                    (0, 255, 0),
                )

    if not rects:
        result.log("No square-like rectangles found that can contain a circle")
        return result

    rect_widths = np.array([r.width for r in rects])
    rect_heights = np.array([r.height for r in rects])

    # Consider that a size of rectangles on a stamp border is a median size of all selected rectangles
    # Acceptable deviation is 20%
    target_rect_w = np.median(rect_widths)
    target_rect_h = np.median(rect_heights)
    rect_size_dev = int(np.ceil(max(target_rect_w, target_rect_h) / 5))
    result.log(
        f"Target rect = {target_rect_w}x{target_rect_h}, max dev = {rect_size_dev}"
    )

    rects_of_target_size = [
        r
        for r in rects
        if np.abs(r.width - target_rect_w) <= rect_size_dev
        and np.abs(r.height - target_rect_h) <= rect_size_dev
    ]

    if debug:
        for r in rects_of_target_size:
            cv2.rectangle(
                debug_img, (r.min_x, r.min_y), (r.max_x, r.max_y), (0, 0, 255)
            )

    cx = [r.center_x for r in rects_of_target_size]
    cy = [r.center_y for r in rects_of_target_size]

    xw_1, xw_2 = find_most_dense_windows(cx, window_size=target_rect_w, num_windows=2)
    yw_1, yw_2 = find_most_dense_windows(cy, window_size=target_rect_h, num_windows=2)

    if (
        xw_1 is None
        or yw_1 is None
        or any(w.num_points < 5 for w in [xw_1, xw_2, yw_1, yw_2])
    ):
        result.log(
            "Didn't manage to find 2 horizontal or vertical lines of at least 5 circles"
        )
        return result

    min_x = min(xw_1.median, xw_2.median)
    max_x = max(xw_1.median, xw_2.median)
    min_y = min(yw_1.median, yw_2.median)
    max_y = max(yw_1.median, yw_2.median)

    result.log(f"Result rect: ({min_x}; {min_y}) ~ ({max_x}; {max_y})")

    result.crop_rect = Rect(
        min_x=min_x, min_y=min_y, width=max_x - min_x + 1, height=max_y - min_y + 1
    )
    result.result = source[min_y : max_y + 1, min_x : max_x + 1]

    if debug:
        cv2.rectangle(debug_img, (min_x, min_y), (max_x, max_y), (111, 10, 131), 1)

    return result


def crop_stamp(source, debug=False):
    r1 = _crop_stamp(source, debug=debug, frame_type="white")
    if r1.crop_rect is not None:
        return r1
    r2 = _crop_stamp(source, debug=debug, frame_type="black")
    if r2.crop_rect is not None:
        return r2
    # Return r1 on failed crop
    return r1
