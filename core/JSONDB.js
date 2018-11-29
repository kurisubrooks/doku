// Written by Funnbot on November 23, 2018
const Logger = require("./Util/Logger");
const path = require("path");
const fs = require("bluebird").promisifyAll(require("fs"));

// Database object cache
let cache = {};
// Database File
let location;
// For database concurency, only one write can be active at a time,
let isWriteEnqueued = false;
let isWriting = false;

class Database {
    /** Load the database into memory
     * @param {String} _location
     * @static */
    static async load(_location) {
        if (!_location) _location = "database.json";
        location = path.join(__dirname, "..", _location);

        try {
            // Attempt to read into cache
            const rawData = await fs.readFileAsync(location);

            // If its a new db file dont require it to be json;
            if (rawData.length === 0) {
                cache = {};
            } else {
                cache = JSON.parse(rawData);
            }
        } catch(err) {
            Logger.fatal("DB Load", `Check if it exists, has read/write permission, and the JSON is valid. File: ${location}`, err);
        }
    }

    /** Get a value by its key
     * @static
     * @param {String} key */
    static get(key) {
        if (!cache.hasOwnProperty(key)) return null;
        return cache[key];
    }

    /** Set a value by its key
     * @param {String} key
     * @param {Any} value
     * @returns */
    static set(key, value) {
        cache[key] = value;
        // Don't trigger another if it will write
        if (isWriteEnqueued) return;
        Database.write();
    }

    /** Access the entire cache
     * @static
     * @param {Function} predicate(cache)
     * @returns */
    static find(predicate) {
        return predicate(cache);
    }

    /** Write the cache to the json file
     * @async
     * @static
     * @private */
    static async write() {
        // Who needs fancy thread blocking when you can java
        // I dont know if we even need to handle concurrency, however if there a multiple writes during a write, it will only do 2 instead of 40
        if (isWriting) {
            isWriteEnqueued = true;
            return;
        }

        if (!cache) {
            Logger.error("DB Write", "Cache was deleted, preventing overwrite.");
        }

        try {
            const data = JSON.stringify(cache);
            isWriting = true;
            await fs.writeFileAsync(location, data);
            isWriting = false;
            Logger.info("DB Write", "Write successful");
        } catch(err) {
            Logger.error("DB Write", "Did you delete the database file? Do I still have permission?");
        }

        if (isWriteEnqueued) {
            isWriteEnqueued = false;
            Database.write();
        }
    }
}

module.exports = Database;
