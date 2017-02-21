import * as requestPromise from 'request-promise';
import * as Promise from 'promise';
import * as moment from 'moment';

export class GoogleTrendsService {
  getPeople() {
    return Promise.resolve(requestPromise(this.getOptions()))
      .then(this.getResponseData);
  }

  private getResponseData(body) {
    return body.data.entityList.map(i => i.title) as string[];
  }

  private getOptions(): requestPromise.OptionsWithUrl {
    return {
      method: 'POST',
      url: 'https://trends.google.com/trends/topcharts/chart',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: this.getRequestData(),
      transform: (body) => JSON.parse(body)
    };
  }

  private getRequestData() {
    let date = '201611';
    return `ajax=1&date=${date}&geo=US&cid=people`;
  }

  private pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }
}
