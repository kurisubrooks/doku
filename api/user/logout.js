const Database = require("../../core/Database");
const Endpoint = require("../../core/Endpoint");

class LogoutHandler extends Endpoint {
    constructor() {
        super({
            name: "Logout",
            description: "Handles User Logouts",
            route: "/api/logout",
            method: "POST",
            token: false,
            admin: false,
            mask: false
        });
    }

    async run(req, res) {
        const user = await Database.verifyToken(req.session.token);

        if (user.ok) {
            this.log(`${user.username} logged out successfully`, "debug");
            req.session.destroy();
            return res.send({ ok: true });
        } else {
            return res.send({ ok: false });
        }
    }
}

module.exports = LogoutHandler;
