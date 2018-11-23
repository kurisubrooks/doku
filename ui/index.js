const Endpoint = require("../core/Endpoint");

class WebUIIndex extends Endpoint {
    constructor() {
        super({
            name: "Index",
            description: "Index",
            method: "GET",
            route: "/",
            auth: true
        });
    }

    async run(req, res, data) {
        //
    }
}

module.exports = WebUIIndex;
