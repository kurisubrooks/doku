const Logger = require("./Logger");

class Util {
    constuctor() {
        throw new Error(`${this.constructor.name} class cannot be instantiated`);
    }

    static error(res, error) {
        Logger.error("Unknown", error);
        res.send({ ok: false, error: error });
        return false;
    }

    static toUpper(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

module.exports = Util;
