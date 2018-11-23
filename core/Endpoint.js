const Logger = require("./Util/Logger");
const { toUpper } = require("./Util/Util");

class Endpoint {
    constructor(data = {}) {
        this.name = data.name;
        this.description = data.description;
        this.disabled = data.disabled || false;
        this.method = data.method || "all";
        this.route = data.route;
        this.view = data.view || false;
        this.auth = data.auth || false;
        this.mask = data.mask || false;
    }

    run() {
        throw new Error("Missing Run Method");
    }

    log(message, style, stacktrace) {
        return Logger[style](toUpper(this.name), message, stacktrace);
    }

    error(message) {
        return Logger.error(toUpper(this.name), message);
    }
}

module.exports = Endpoint;
