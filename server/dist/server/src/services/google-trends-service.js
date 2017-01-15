"use strict";
const requestPromise = require("request-promise");
const Promise = require("promise");
const moment = require("moment");
class GoogleTrendsService {
    getPeople() {
        return Promise.resolve(requestPromise(this.getOptions()))
            .then(this.getResponseData);
    }
    getResponseData(body) {
        return body.data.entityList.map(i => i.title);
    }
    getOptions() {
        return {
            method: 'POST',
            url: 'https://www.google.com/trends/topcharts/chart',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: this.getRequestData(),
            transform: (body) => JSON.parse(body)
        };
    }
    getRequestData() {
        let threeMonthsAgo = moment().add(-3, 'month');
        let date = `${threeMonthsAgo.year()}${this.pad(threeMonthsAgo.month() + 1, 2)}`;
        return `ajax=1&date=${date}&geo=US&cid=people`;
    }
    pad(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
}
exports.GoogleTrendsService = GoogleTrendsService;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/services/google-trends-service.js.map