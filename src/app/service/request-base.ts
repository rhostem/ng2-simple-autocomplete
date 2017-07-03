import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class RequestBase {
  headers = new Headers();
  noPreFlightHeaders = new Headers();

  get requestOptions(): RequestOptions {
    return new RequestOptions({
      headers: this.headers
    });
  }
  get requestOptionsNoPre(): RequestOptions {
    return new RequestOptions({
      headers: this.noPreFlightHeaders,
    });
  };

  constructor(public http: Http) {
    this.headers.append('Content-Type', 'application/json');
    this.noPreFlightHeaders.append('Content-Type', 'text/plain');
  }
}
