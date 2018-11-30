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
        if (!data.username) return res.send({ ok: false, error: "Missing Required Fields" });
        if (!data.password) return res.send({ ok: false, error: "Missing Required Fields" });

        const users = Database.get("users");

        if (users[data.username]) {
            // do checks
            const user = users[data.username];
            const verify = Database.verify(user, data.password);
            // check password
            if (verify.ok) {
                // success
                req.session.token = verify.token;
                req.session.admin = verify.admin;
                this.log(`${data.username} logged in successfully`, "debug");
                return res.send({ ok: true });
            }
        }

        return res.send({ ok: false, error: "Invalid Credentials" });
    }
}

module.exports = LoginHandler;
