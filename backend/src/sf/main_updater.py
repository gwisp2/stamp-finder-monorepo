"""
Updater process: periodically downloads updates from stamps repository.
Also scrapes stamps from rusmarka.ru when stamps data is updated.
"""
from sf.core import log
from sf.core.log.server_log_implementation import ServerLogImplementation
from sf.service.sfb_core import SfbCore


def main():
    log.ImplementationStorage.set(ServerLogImplementation())
    core = SfbCore.create()
    core.do_initial_setup()
    core.run_update_loop()


if __name__ == "__main__":
    main()
