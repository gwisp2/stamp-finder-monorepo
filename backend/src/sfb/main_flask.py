import io
from typing import List, Union

from flask import Flask, request
from flask_cors import CORS
from loguru import logger

from sfb.sfb_core import SfbCore
from sfb.shops_updater import ShopNotUpdatedException

ERR_MISSING_FILE = "Файл отсутствует"
ERR_BAD_EXTENSION = "Файл имеет неверное расширение"

core = SfbCore.create()
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 1 << 20  # 1 MiB file upload max
app.config["JSON_AS_ASCII"] = False
CORS(app)


class ApiException(Exception):
    def __init__(self, message: str):
        self.message = message


@app.errorhandler(ApiException)
def handle_api_exception(e: ApiException):
    return {"status": "error", "message": e.message}, 400


def has_extension(filename: str, extensions: Union[str, List[str]]) -> bool:
    extensions: List[str] = [extensions] if isinstance(extensions, str) else extensions
    if "." not in filename:
        return False
    extension = filename.rsplit(".", 1)[1].lower()
    return extension in extensions


@app.route("/api/upload", methods=["POST"])
def handle_upload():
    file = request.files.get("file", None)
    if file is None or file.filename == "":
        raise ApiException(ERR_MISSING_FILE)
    if not has_extension(file.filename, ["xls"]):
        raise ApiException(ERR_BAD_EXTENSION)
    file_content = io.BytesIO()
    file.save(file_content)

    try:
        core.upload_shop_quantities_file(file_content.getvalue())
        return {"status": "ok"}
    except ShopNotUpdatedException as e:
        raise ApiException(e.message)


if __name__ == "__main__":
    logger.info("Starting web server")
    app.run("0.0.0.0")
