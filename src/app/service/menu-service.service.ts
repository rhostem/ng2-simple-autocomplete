import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MenuService {
  isVisibleOnMobile = true;

  constructor() {
  }

  onClickMenuIcon() {
    const prev = this.isVisibleOnMobile;
    this.isVisibleOnMobile = !prev;
  }
}
