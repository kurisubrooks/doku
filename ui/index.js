const Endpoint = require("../core/Endpoint");

class WebUIMain extends Endpoint {
    constructor() {
        super({
            name: "Home",
            description: "Home Page Renderer",
            method: "GET",
            route: "/",
            auth: false
        });
    }

    async run(req, res, data) {
        if (!req.session || !req.session.token) {
            return res.redirect("/login");
        }

        return res.render("ui/views/_layout", {
            title: "Home",
            template: null,
            content: "_error.ejs"
        });
    }
}

module.exports = WebUIMain;
