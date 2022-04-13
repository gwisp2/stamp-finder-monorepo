"""
Updater process: periodically downloads updates from stamps repository.
Also scrapes stamps from rusmarka.ru when stamps data is updated.
"""

from sfb.sfb_core import SfbCore


def main():
    core = SfbCore.create()
    core.do_initial_setup()
    core.run_update_loop()


if __name__ == "__main__":
    main()
