import io
from typing import List, Optional

from docopt import docopt

from sf.tasks.task import Task, UnknownTask, UnknownTaskType
from sf.tasks.task_images_build import TaskImagesBuild
from sf.tasks.task_shops_join import TaskShopsJoin
from sf.tasks.task_shops_parse_xls import TaskShopsParseXls
from sf.tasks.task_shops_scrape import TaskShopsScrape
from sf.tasks.task_stamps_reformat import TaskStampsReformat
from sf.tasks.task_stamps_scrape_categories import TaskStampsScrapeCategories
from sf.tasks.task_stamps_scrape_new import TaskStampsScrapeNew

cli_tasks: List[UnknownTaskType] = [
    TaskImagesBuild,
    TaskShopsParseXls,
    TaskShopsJoin,
    TaskShopsScrape,
    TaskStampsReformat,
    TaskStampsScrapeCategories,
    TaskStampsScrapeNew,
]


def cli_usage() -> str:
    docopt_usage = io.StringIO()
    docopt_usage.write("Usage:\n")
    for task in cli_tasks:
        docopt_usage.write("  ")
        docopt_usage.write("sf ")
        docopt_usage.write(" ".join(task.command_name))
        docopt_usage.write(" ")
        docopt_usage.write(task.docopt_line)
        docopt_usage.write("\n")
    return docopt_usage.getvalue()


def parse_cli_command(cli_args: List[str]) -> Optional["Task"]:
    args = docopt(
        cli_usage(), argv=cli_args, help=False, version=None, options_first=False
    )
    task = next(
        (
            task
            for task in cli_tasks
            if all(args[name_part] for name_part in task.command_name)
        ),
        None,
    )
    if task is None:
        return None
    return task.parse_docopt_dict(args)
