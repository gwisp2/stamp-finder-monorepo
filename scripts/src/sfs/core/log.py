from tqdm import tqdm


def info(message: str) -> None:
    tqdm.write(message)


def progressbar(*args, **kwargs):
    return tqdm(*args, **kwargs)
