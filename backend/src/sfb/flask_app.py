import io

from flask import Flask, request
from flask_cors import CORS
from loguru import logger

from sfb.shops_updater import ShopNotUpdatedException, ShopsUpdater


class FlaskApp:
    def __init__(self, shops_updater: ShopsUpdater):
        self.app = Flask(__name__)
        self.app.config["MAX_CONTENT_LENGTH"] = 1 << 20  # 1 MiB file upload max
        self.shops_updater = shops_updater
        CORS(self.app)

        @self.app.route("/api/upload", methods=["POST"])
        def upload():
            return self.handle_upload()

    def run(self):
        logger.info("Starting web server")
        self.app.run("0.0.0.0")

    @staticmethod
    def is_allowed_file(filename: str) -> bool:
        return "." in filename and filename.rsplit(".", 1)[1].lower() in ["xls"]

    def handle_upload(self):
        if "file" not in request.files:
            return {"status": "error", "message": "Файл отсутствует"}
        file = request.files["file"]
        if file.filename == "" or not file:
            return {"status": "error", "message": "Файл отсутствует"}
        if not self.is_allowed_file(file.filename):
            return {"status": "error", "message": "Файл имеет неверное расширение"}
        file_content = io.BytesIO()
        file.save(file_content)
        try:
            self.shops_updater.handle_new_xls(file_content.getvalue())
            return {"status": "ok"}
        except ShopNotUpdatedException as e:
            return {
                "status": "error",
                "message": e.message,
            }
