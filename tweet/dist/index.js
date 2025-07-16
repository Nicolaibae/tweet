"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_service_1 = __importDefault(require("./services/database.service"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const medias_routes_1 = __importDefault(require("./routes/medias.routes"));
const files_1 = require("./utils/files");
const dotenv_1 = require("dotenv");
const minimist_1 = __importDefault(require("minimist"));
const option = (0, minimist_1.default)(process.argv.slice(2));
(0, dotenv_1.config)();
database_service_1.default.connect();
const port = process.env.PORT || 4000;
(0, files_1.initFolder)(); // khi khởi động sever nếu chauw có folder sẽ tự động tạo
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/users", users_routes_1.default);
app.use("/medias", medias_routes_1.default);
app.use(error_middleware_1.defaultErrorHandler);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
