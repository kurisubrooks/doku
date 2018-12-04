const Logger = require("./Util/Logger");
const Store = require("./Store");

const valid = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

class Database {
    static get template() {
        return {
            "users": []
        };
    }

    static generateToken() {
        return crypto.randomBytes(Math.ceil(32 / 2)).toString("hex");
    }

    static async verifyToken(token) {
        const db = Store.get("users");
        const user = db.find(user => user.token === token);
        return user
            ? { ok: true, username: user.username, token }
            : { ok: false, error: "Unable to Authenticate Token", input: token };
    }

    static async verifyUsername(username) {
        const db = Store.get("users");
        const user = db.some(user => user.username === username);
        return { ok: user };
    }

    static async verifyLogin(username, password) {
        if (!username) return { ok: false, error: "Missing Username" };
        if (!password) return { ok: false, error: "Missing Password" };

        const db = Store.get("users");

        // Check if Username exists
        const user = db.find(user => user.username === username);
        if (!user) return { ok: false, error: "Incorrect Credentials" };

        // Compare Input Password with Stored Password
        const auth = await bcrypt.compare(password, user.password);

        // Return results
        return auth
            ? { ok: true, token: user.token, admin: user.admin }
            : { ok: false, error: "Incorrect Credentials" };
    }

    static async newUser(data) {
        if (!data) return { ok: false, error: "Missing Data" };
        if (!data.name) return { ok: false, error: "Missing Display Name" };
        if (!data.email) return { ok: false, error: "Missing Email" };
        if (!data.username) return { ok: false, error: "Missing Username" };
        if (!data.password) return { ok: false, error: "Missing Password" };

        // Retrieve Database
        const users = Store.get("users");

        // Check if user already exists
        const nameCheck = users.some(user => user.username === data.username);
        if (nameCheck) return { ok: false, error: "Username already exists" };
        Logger.debug("New User", "OK: Username is available");

        // Check if email is valid
        if (!valid.isEmail(data.email)) return { ok: false, error: "Invalid Email" };
        Logger.debug("New User", "OK: Email is valid");

        // Check if username is valid
        if (!/^[a-zA-Z0-9]+$/.test(data.username)) return { ok: false, error: "Invalid Username" };
        Logger.debug("New User", "OK: Username is valid");

        // Check if token already exists
        const token = Database.generateToken();
        const tokenCheck = users.some(user => user.token === token);
        if (tokenCheck) return { ok: false, error: "Internal Server Error" };
        Logger.debug("New User", "OK: Generated token is available");

        // Hash password
        const password = bcrypt.hashSync(data.password, 10);
        Logger.debug("New User", "OK: Password successfully hashed");

        // Add user to db
        // Re-retrieve Database incase the above methods took long and there were changes to the database in the meantime (yes im being paranoid)
        const db = Store.get("users");

        const user = {
            token,
            created: new Date().toISOString(),
            name: data.name,
            username: data.username,
            email: data.email,
            password,
            admin: false,
            disabled: false,
            data: {}
        };

        db.push(user);
        Store.set("users", db);

        Logger.debug("New User", "OK: User Added to Database");

        return { ok: true, username: data.username, token };
    }
}

module.exports = Database;
