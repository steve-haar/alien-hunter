"use strict";
const Promise = require("promise");
const _1 = require("./");
class NameService {
    constructor() {
        this.googleTrendsService = new _1.GoogleTrendsService();
    }
    getName(existingNames) {
        return this._getNames()
            .then(function (names) {
            names = names.filter(name => existingNames.indexOf(name) === -1);
            let randomIndex = Math.floor(Math.random() * names.length);
            return names[randomIndex];
        });
    }
    getNames(existingNames, number) {
        return this._getNames()
            .then(function (names) {
            names = names.filter(name => existingNames.indexOf(name) === -1);
            let results = [];
            for (let i = 0; i < number; i++) {
                let randomIndex = Math.floor(Math.random() * names.length);
                results.push(names.splice(randomIndex, 1)[0]);
            }
            return results;
        });
    }
    _getNames() {
        if (this.names) {
            return new Promise((resolve, reject) => resolve(this.names));
        }
        else {
            return this.googleTrendsService.getPeople()
                .then(names => this.names = names);
        }
    }
}
exports.NameService = NameService;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/services/name-service.js.map