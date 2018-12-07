const Database = require("../core/Database");
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
        const user = await Database.verifyToken(req.session.token);

        if (user.ok) {
            this.log(`${user.username} logged out successfully`, "debug");
            req.session.destroy();
        }

        return res.redirect("/");
    }
}

module.exports = WebUILogout;
