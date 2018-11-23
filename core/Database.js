const Logger = require("./Util/Logger");
const Util = require("./Util/Util");

const valid = require("validator");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

class Database {
    static get location() {
        return path.join(__dirname, "..", "database.json");
    }

    static initDB() {
        // Check if DB file exists
        if (!fs.existsSync(Database.location())) {
            try {
                fs.writeFileSync(Database.location(), JSON.stringify({}));
                return true;
            } catch(error) {
                Logger.error("DB Write", error, true);
                return false;
            }
        }

        // Check if DB is readable
        if (!Database.readDB()) {
            Logger.error("DB Read", "Unable to read database. Check the file permissions.");
            process.exit(1);
        }

        return true;
    }

    static async readDB() {
        try {
            // Read File and return it
            const read = await fs.readFile(Database.location());
            if (!read) return false;
            return read;
        } catch(error) {
            Logger.error("DB Read", error, true);
            return false;
        }
    }

    static findInDB(key, type) {
        if (type === "key") {
            //
        }

        if (type === "token") {
            //
        }
    }

    static async checkToken(token) {
        if (!token) return { ok: false, error: "Missing Token" };
        const user = await Database.Models.User.findOne({ where: { token } });
        return user
            ? { ok: true, username: user.username, token }
            : { ok: false, error: "Unable to Authenticate Token", input: token };
    }

    static async checkLogin(username, password) {
        if (!username) return { ok: false, error: "Missing Username" };
        if (!password) return { ok: false, error: "Missing Password" };

        // Check if username exists
        const user = await Database.Models.User.findOne({ where: { username } });
        if (!user) return { ok: false, error: "Incorrect Credentials" };

        // Compare passwords
        const auth = await bcrypt.compare(password, user.password);

        // Return Results
        return auth
            ? { ok: true, token: user.token, admin: user.admin }
            : { ok: false, error: "Incorrect Credentials" };
    }

    static async newUser(data) {
        if (!data) return { ok: false, error: "Missing Data" };
        if (!data.auth) return { ok: false, error: "Missing Auth Key" };
        if (!data.email) return { ok: false, error: "Missing Email" };
        if (!data.username) return { ok: false, error: "Missing Username" };
        if (!data.password) return { ok: false, error: "Missing Password" };

        // Check auth key
        const keyCheck = await Database.Models.RegKeys.findOne({ where: { key: data.auth } });
        if (!keyCheck) return { ok: false, error: "Invalid Auth Key" };
        Logger.debug("New User", "OK: Auth Key is valid");

        // Check if user already exists
        const nameCheck = await Database.Models.User.findOne({ where: { username: data.username } });
        if (nameCheck) return { ok: false, error: "Username already exists" };
        Logger.debug("New User", "OK: Username is available");

        // Check if email is valid
        if (!valid.isEmail(data.email)) return { ok: false, error: "Invalid Email" };
        Logger.debug("New User", "OK: Email is valid");

        // Check if username is valid
        if (!/^[a-zA-Z0-9]+$/.test(data.username)) return { ok: false, error: "Invalid Username" };
        Logger.debug("New User", "OK: Username is valid");

        // Check if token already exists
        const token = Util.generateToken();
        const tokenCheck = await Database.Models.User.findOne({ where: { token } });
        if (tokenCheck) return { ok: false, error: "Internal Server Error" };
        Logger.debug("New User", "OK: Generated token is available");

        // Hash password
        const hash = bcrypt.hashSync(data.password, 10);
        Logger.debug("New User", "OK: Password successfully hashed");

        // Delete Key from DB
        const keyRemove = await Database.Models.RegKeys.findOne({ where: { key: data.auth } });
        if (!keyRemove) return { ok: false, error: "Internal Server Error" };
        await keyRemove.destroy();
        Logger.debug("New User", "OK: Auth Key deleted successfully");

        // Add user to db
        const user = await Database.Models.User.create({
            admin: data.admin || false,
            token: token,
            email: data.email,
            username: data.username,
            password: hash,
            permissions: JSON.stringify({}),
            disabled: false
        });

        if (!user) return { ok: false, error: "Internal Server Error" };
        Logger.debug("New User", "OK: User Added to Database");

        return { ok: true, username: data.username, token };
    }
}

module.exports = Database;
