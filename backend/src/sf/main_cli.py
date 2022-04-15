import sys

from sf import tasks


def main():
    task = tasks.parse_cli_command(sys.argv[1:])
    if not task:
        sys.stderr.write(tasks.cli_usage())
        sys.exit(1)
    task.run()


if __name__ == "__main__":
    main()
