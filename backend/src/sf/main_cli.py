import json
import sys
from pathlib import Path

from sf import tasks
from sf.core import ExtractedShopItems


def main():
    task = tasks.parse_cli_command(sys.argv[1:])
    if not task:
        sys.stderr.write(tasks.cli_usage())
        sys.exit(1)
    task.run()


if __name__ == "__main__":
    e = ExtractedShopItems.from_json(
        json.loads(Path("rusmarka.json").read_text("utf8"))
    )
    e.items = [i for i in e.items if not i.name.startswith("г")]
    Path("rusmarka2.json").write_text(
        json.dumps(e.to_json(), ensure_ascii=False, indent=2), encoding="utf8"
    )
    print(e)
    # main()
