import re
from typing import Optional, List


def extract_ids(art: str) -> Optional[List[int]]:
    range_art_match = re.search(r'(\d+)-(\d+)', art)
    single_art_match = re.search(r'(\d+)', art)
    if range_art_match:
        start_id = int(range_art_match.group(1))
        end_id = int(range_art_match.group(2))
        return list(range(start_id, end_id + 1))
    elif single_art_match:
        return [int(single_art_match.group(1))]
    else:
        return None
