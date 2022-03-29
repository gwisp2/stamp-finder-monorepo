import argparse
import progressbar
import sys

from sfs.commands import command_list


def main():
    progressbar.streams.wrap_stderr()
    parser = argparse.ArgumentParser()
    parser.set_defaults(command_=None)
    subparsers = parser.add_subparsers()
    for command in command_list:
        subparser: argparse.ArgumentParser = subparsers.add_parser(command.name)
        command.configure_parser(subparser)
        subparser.set_defaults(command_=command)
    parsed_args = parser.parse_args(sys.argv[1:])
    command = parsed_args.command_
    if not command:
        sys.stderr.write("No command specified\n")
        sys.exit(1)
    command.run(parsed_args)


if __name__ == "__main__":
    main()
