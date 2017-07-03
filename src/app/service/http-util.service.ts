import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { RequestBase } from './request-base';
import R from 'ramda';

@Injectable()
export class HttpUtilService extends RequestBase {

  constructor(
    public http: Http,
  ) {
    super(http);
  }

  /**
   * http.get 메소드 래핑
   * @param endPoint 똑닥 sales API endpoint
   * @param search 요청 파라미터 객체
   */
  getAPI(endPoint: string, search?: any): Observable<any> {
    return this.http.get(
      endPoint,
      Object.assign({}, this.requestOptions, {
        search: this.makeSearchParams(search),
      }),
    );
  }

  /**
   * http.post 메소드 래핑
   * @param endPoint 똑닥 sales API endpoint
   * @param body 본문 객체
   * @param option 옵션 객체
   */
  postAPI(endPoint: string, body: any, options?: any): Observable<any> {
    return this.http.post(
      endPoint,
      body,
      Object.assign({}, this.requestOptions, options),
    );
  }

  /**
   * http.put 메소드 래핑
   * @param endPoint 똑닥 sales API endpoint
   * @param body 본문 객체
   * @param option 옵션 객체
   */
  putAPI(endPoint: string, body: any, options?: any): Observable<any> {
    return this.http.put(
      endPoint,
      body,
      Object.assign({}, this.requestOptions, options),
    );
  }

  /**
   * http.delete 메소드 래핑
   * @param endPoint 똑닥 sales API endpoint
   * @param option 옵션 객체
   */
  deleteAPI(endPoint: string, options?: any): Observable<any> {
    return this.http.delete(
      endPoint,
      Object.assign({}, this.requestOptions, options),
    );
  }

  /**
   * Http.get 메소드에서 사용할 search 옵션 생성 유틸리티
   *
   * @return searchParams: URLSearchParams
   */
  makeSearchParams(params = {}) {
    const keys = R.keys(this.trimQueryParams(params));
    const values = R.values(this.trimQueryParams(params));
    const makeQuery = (key, val) => `${key}=${val}`;
    const queries = R.zipWith(makeQuery, keys, values);
    const queryString = queries.join('&');
    const searchParams = new URLSearchParams(queryString);

    return searchParams;
  }

  /**
   * 객체를 쿼리스트링으로 변환.
   * 문자열에 encodeURIComponent 메소드를 적용한다.
   */
  convertObectToQuerystring(params: Object) {
    const trimmedParams = this.trimQueryParams(params);
    const keys = R.keys(trimmedParams);
    const values = R.values(trimmedParams);
    const makeQuery = (key, val) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
    const querys = R.zipWith(makeQuery, keys, values);
    const joinQuery = R.pipe(
      R.join('&'),
      (joinedQuery) => `&${joinedQuery}`,
    );

    return joinQuery(querys);
  }

  /**
   * 쿼리스트링 파라미터 중에서 null, undefined, 공백 값을 가지는 키는 제거한다.
   * @param queryParams
   */
  trimQueryParams(queryParams: any) {
    const isNotNil = R.compose(R.not, R.isNil);
    const isNotEmptyStr = R.compose(
      R.not,
      (str) => (typeof str === 'string') ? str.replace(/\s/g, '') === '' : false,
    );
    return R.filter(R.both(isNotNil, isNotEmptyStr), queryParams);
  }
}

