const Endpoint = require("../core/Endpoint");

class WebUINewMedication extends Endpoint {
    constructor() {
        super({
            name: "New Medication",
            description: "New Medication",
            method: "GET",
            route: "/medication/new",
            auth: false,
            mask: true
        });
    }

    async run(req, res, data) {
        return res.render("ui/views/new_medication", {
            title: "New Medication"
        });
    }
}

module.exports = WebUINewMedication;
