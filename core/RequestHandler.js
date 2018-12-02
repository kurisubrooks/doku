const path = require("path");
const express = require("express");
const bodyparser = require("body-parser");
const session = require("express-session");
// const hbs = require("express-handlebars");

const keychain = require("../keychain.json");
const Logger = require("./Util/Logger");
const Database = require("./Database");
const EndpointManager = require("./EndpointManager");

class RequestHandler {
    constructor(app) {
        this.express = express;
        this.router = this.express.Router(); // eslint-disable-line new-cap
        this.server = app;

        this.server.use(bodyparser.json());
        this.server.use(bodyparser.urlencoded({ extended: true }));
        this.server.use(session({ resave: 1, saveUninitialized: 0, secret: keychain.session, maxAge: 168 * 60 * 60 * 1000 }));

        // this.server.engine(".hbs", hbs({ extname: ".hbs", defaultLayout: "../../ui/views/_template.hbs" }));
        this.server.set("view engine", "ejs");
        this.server.set("views", path.join(__dirname, ".."));
        this.server.use("/assets", express.static("ui/assets/"));
        this.server.use(this.router);

        this.handler = new EndpointManager(this.server);
        this.handler.loadModules("api/*/*.js");
        this.handler.loadModules("ui/*.js");

        this.routes = this.handler.routes;
        this.handleRoutes();
    }

    handleRoutes() {
        // Endpoints
        for (const item of this.routes.values()) {
            this.router.all(item.route, this.handle.bind(this));
        }

        // Static Files
        this.router.all("*", this.handle.bind(this));
    }

    async handle(req, res) {
        const ip = req.headers["x-real-ip"] || req.ip.replace("::ffff:", "");
        const url = req.url.split("?")[0];
        const token = req.headers.authorization;
        const method = req.method;
        const data = method === "GET" ? req.query : req.body;
        const route = this.routes.get(req.route.path);
        const masked = route && route.mask ? {} : data;
        const user = token
            ? await Database.verifyToken(token)
            : req.session && req.session.token
                ? await Database.verifyToken(req.session.token)
                : { ok: false };

        // Handle 404
        if (!route) {
            if (method === "GET") {
                res.status(404).render("ui/views/_error.ejs", { error: 404 });
            } else {
                res.status(404).send({ ok: false, error: "404, Page Not Found" });
            }

            return this.log(false, ip, url, masked, user, method, 404);
        }

        // Check GET/POST Endpoint Request Methods
        if (route.method !== "all" && route.method !== method) {
            res.status(405).send({ ok: false, error: "405, Method Not Allowed" });
            return this.log(false, ip, url, masked, user, method, 405);
        }

        // Enforce User Authentication System
        if (route.auth && ((req.session || !req.session.token) || !user.ok)) {
            res.status(403).redirect("/login");
            return this.log(false, ip, url, masked, user, method, 401);
        }

        this.log(true, ip, url, masked, user, method);
        res.set("X-Powered-By", "Sherlock Core 2; Doku");
        res.set("Access-Control-Allow-Origin", "*");

        // Simple Route Handling
        if (route.view) {
            return res.render(path.join(__dirname, "..", route.view));
        }

        // Complex Route Handling
        return route.run(req, res, data);
    }

    log(ok, ip, url, data, auth, method, code) {
        const style = ok ? "success" : "error";
        const indicator = ok ? "✓" : "✘";
        const user = auth && auth.ok ? auth.username : ip;
        const body = Object.keys(data).length > 0 ? data : null;
        return Logger[style]("Router", `${method} ${user} ${url} ${body ? `${JSON.stringify(body)} ` : ""}${indicator} ${code ? ` ${code}` : ""}`);
    }
}

module.exports = RequestHandler;
