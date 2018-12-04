const Endpoint = require("../../core/Endpoint");
const Database = require("../../core/Database");

class LoginHandler extends Endpoint {
    constructor() {
        super({
            name: "Login",
            description: "Handles User Logins",
            route: "/api/login",
            method: "POST",
            token: false,
            admin: false,
            mask: true
        });
    }

    async run(req, res, data) {
        if (req.session.token) {
            return res.send({ ok: false, error: "Already Logged In" });
        }

        if (!data.username || !data.password) {
            return res.send({ ok: false, error: "Missing Required Fields" });
        }

        const verify = await Database.verifyLogin(data.username, data.password);

        if (verify.ok) {
            req.session.token = verify.token;
            req.session.admin = verify.admin;

            this.log(`${data.username} logged in successfully`, "debug");
            return res.send({ ok: true });
        }

        return res.send({ ok: false, error: verify.error });
    }
}

module.exports = LoginHandler;
