const Endpoint = require("../core/Endpoint");
const fs = require("fs");

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
        return res.render("ui/views/_layout", {
            title: "Login",
            template: "login",
            content: "login.ejs"
        });
    }
}

module.exports = WebUILogin;
