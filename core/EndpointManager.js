const path = require("path");
const glob = require("glob");

const { toUpper } = require("./Util/Util");
const Logger = require("./Util/Logger");
const Collection = require("./Util/Collection");

class EndpointManager {
    constructor(app) {
        this.app = app;
        this.routes = new Collection();
    }

    /** Load Modules into memory
     * @param {String} pattern Glob of files in directory */
    loadModules(pattern) {
        const files = glob.sync(pattern);

        for (const file of files) {
            const location = path.join(__dirname, "..", file);
            this.startModule(location);
        }
    }

    /** Start Module and save to memory
     * @param {String} location Location of File
     * @param {Boolean} isReload */
    startModule(location, isReload) {
        const Endpoint = require(location);
        const instance = new Endpoint(this.app);
        instance.location = location;

        if (instance.disabled) return false;
        if (this.routes.has(instance.route)) throw new Error("Endpoints cannot have the same route");

        Logger.info(`${isReload ? "Reloaded" : "Loaded"} Endpoint`, toUpper(instance.route));
        return this.routes.set(instance.route, instance);
    }

    /** Restart Module and refresh cache
     * @param {String} route Route of the API Endpoint */
    restartModule(route) {
        const existingModule = this.routes.get(route);
        if (!existingModule) return false;
        const location = existingModule.location;
        this.routes.delete(route);
        delete require.cache[require.resolve(location)];
        this.startModule(location, true);
        return true;
    }
}

module.exports = EndpointManager;
