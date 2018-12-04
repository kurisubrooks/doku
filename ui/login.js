const Endpoint = require("../core/Endpoint");

class WebUILogin extends Endpoint {
    constructor() {
        super({
            name: "Login",
            description: "Login",
            method: "GET",
            route: "/login",
            auth: false,
            mask: true
        });
    }

    async run(req, res, data) {
        return res.render("ui/views/login", {
            title: "Login"
        });
    }
}

module.exports = WebUILogin;
