const Endpoint = require("../../core/Endpoint");
const Database = require("../../core/Database");

class RegistrationHandler extends Endpoint {
    constructor() {
        super({
            name: "Register",
            description: "Handles creation of new users",
            route: "/api/register",
            method: "POST",
            token: false,
            admin: false,
            mask: true
        });
    }

    async run(req, res, data) {
        const register = await Database.newUser(data);
        return res.send(register);
    }
}

module.exports = RegistrationHandler;
