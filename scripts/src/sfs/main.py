"""SFS - Stamp Finder Scripts

Usage:
  sfs stamps scrape-new --db=<db> [--links-page=<url>]
  sfs stamps scrape-categories --db=<db>
  sfs stamps reformat --db=<db>
  sfs images build --db=<db> --size=<size_px>
  sfs shops scrape --out=<json_file>
  sfs shops parse-xls --out=<json_file> <xls_file>
  sfs shops join --out=<json_file> [--metadata=<json_file>] [<input_json_file>]...

  sfs (-h | --help)

Options:
  -h --help                  Show this screen.
  --db=<db>                  Path to stamps database directory containing stamps.json.
  --links-page=<url>         URL of page where links to new positions are located,
                             by default the link to category 'Новинки' is used.
  --out=<json_file>         .json file where extracted data will be written
  --format=<filename_format> Template to use for new image file names. No-op format is '{filename}.{ext}'.
  --size=<size_px>           Maximum allowed size of image in pixels. Images of a larger size will be downscaled.
"""
import io
import sys
import traceback

from docopt import docopt
from pydantic import BaseModel

from sfs.commands import command_list
from sfs.core import log
from sfs.core.log import DefaultLogImpl, EmbeddedLogImpl


class SfsRunResult(BaseModel):
    out: bytes
    code: int


def embedded_main(argv, catch_log=True) -> SfsRunResult:
    code = 0
    out = io.BytesIO()
    # noinspection PyBroadException
    try:
        log.LogImpl.set(EmbeddedLogImpl(out) if catch_log else DefaultLogImpl())
        main(argv)
    except SystemExit as e:
        if isinstance(e.code, str):
            log.info(e.code)
            code = 1
        else:
            code = e.code
    except Exception as e:
        log.info(traceback.format_exc())
        code = 2
    return SfsRunResult(out=out.getvalue(), code=code)


def main(argv):
    parse_result = docopt(
        __doc__, argv=argv, help=True, version=None, options_first=False
    )
    command = next(
        (
            cmd
            for cmd in command_list
            if all(parse_result[name_p] for name_p in cmd.name_as_list())
        ),
        None,
    )

    if not command:
        log.info("No command specified\n")
        sys.exit(1)

    command(args=parse_result).run()


if __name__ == "__main__":
    main(sys.argv[1:])
