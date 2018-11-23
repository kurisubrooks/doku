const Endpoint = require("../core/Endpoint");

class WebUILogout extends Endpoint {
    constructor() {
        super({
            name: "Logout",
            description: "Logout",
            route: "/logout",
            method: "GET",
            token: false,
            admin: false,
            mask: true
        });
    }

    async run(req, res) {
        delete req.session.token;
        delete req.session.admin;
        return res.redirect("/login");
    }
}

module.exports = WebUILogout;
