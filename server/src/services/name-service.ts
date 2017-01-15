import * as Promise from 'promise';
import { GoogleTrendsService } from './';

export class NameService {
  private googleTrendsService = new GoogleTrendsService();
  private names: string[];

  public getName(existingNames: string[]) {
    return this._getNames()
      .then(function (names: string[]) {
        names = names.filter(name => existingNames.indexOf(name) === -1);
        let randomIndex = Math.floor(Math.random() * names.length);
        return names[randomIndex];
      });
  }

  public getNames(existingNames: string[], number: number) {
    return this._getNames()
      .then(function (names: string[]) {
        names = names.filter(name => existingNames.indexOf(name) === -1);
        let results: string[] = [];
        for (let i = 0; i < number; i++) {
          let randomIndex = Math.floor(Math.random() * names.length);
          results.push(names.splice(randomIndex, 1)[0]);
        }
        return results;
      });
  }

  private _getNames() {
    if (this.names) {
      return new Promise((resolve, reject) => resolve(this.names));
    } else {
      return this.googleTrendsService.getPeople()
        .then(names => this.names = names);
    }
  }
}
