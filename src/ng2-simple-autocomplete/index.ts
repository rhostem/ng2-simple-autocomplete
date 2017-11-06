import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  Sanitizer,
  SecurityContext,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';
import * as R from 'ramda';

import { AutoCompleteItem, AutocompleteStyle } from './model';

const isArrowUp = keyCode => keyCode === 38;
const isArrowDown = keyCode => keyCode === 40;
const isArrowUpDown = keyCode => isArrowUp(keyCode) || isArrowDown(keyCode);
const isEnter = keyCode => keyCode === 13;
const isBackspace = keyCode => keyCode === 8;
const isDelete = keyCode => keyCode === 46;
const isESC = keyCode => keyCode === 27;
const isTab = keyCode => keyCode === 9;
const isEmptyString = (str = '') => str.replace(/\s/g, '') === '';
const removeSpace = (str = '') => {
  if (typeof str === 'string') {
    return str.replace(/\s/g, '');
  }
  return str;
};

@Component({
  selector: 'ng2-simple-autocomplete',
  template: `
    <div
      [ngClass]="{'autocomplete': !useCSSFramework}"
      [ngStyle]="{style: !useCSSFramework}"
    >

      <input
        #searchInput
        [(ngModel)]="_search"
        class="autocomplete-input"
        [ngClass]="inputClasses"
        type="text"
        autocomplete="off"
        (keydown)="preventCursorPosition($event)"
        (focus)="onFocusin()"
        (focusout)="onFocusout($event)"
        [placeholder]="placeholder"
      />
      <div
        class="autocomplete-iconWrapper"
        [ngClass]="{ 'is-visible': isResetButtonVisible}"
        [ngStyle]="{ 'font-size': style['font-size']}"
        (click)="onResetSearchText()"
      >
        <span class="autocomplete-icon deleteIcon">✕</span>
      </div>


      <div
        [ngClass]="{
          'autocomplete-iconWrapper': true, 'is-visible': isLoading
        }"
      >
        <div class="sk-fading-circle autocomplete-icon">
          <div class="sk-circle1 sk-circle"></div>
          <div class="sk-circle2 sk-circle"></div>
          <div class="sk-circle3 sk-circle"></div>
          <div class="sk-circle4 sk-circle"></div>
          <div class="sk-circle5 sk-circle"></div>
          <div class="sk-circle6 sk-circle"></div>
          <div class="sk-circle7 sk-circle"></div>
          <div class="sk-circle8 sk-circle"></div>
          <div class="sk-circle9 sk-circle"></div>
          <div class="sk-circle10 sk-circle"></div>
          <div class="sk-circle11 sk-circle"></div>
          <div class="sk-circle12 sk-circle"></div>
        </div>
      </div>


      <div
        class="autocomplete-result"
        [ngClass]="{ 'is-visible': isNoResultsVisible }"
      >
        <span class="autocomplete-item">{{ noResultText }}</span>
      </div>

      <ul
        #searchResultsEl
        class="autocomplete-result"
        [ngClass]="{ 'is-visible': isResultVisible }"
        [ngStyle]="{ 'max-height': maxHeight }"
      >
        <li
          *ngFor="let result of searchResultsOnVisble;let i = index"
          class="autocomplete-item"
          [ngClass]="{ 'is-focus': result.isFocus === true }"
        >
          <div [innerHtml]="sanitize(result.markup || result.text)"></div>
          <div
            class="itemClickLayer"
            (mouseover)="onMouseOverResultItem(i)"
            (click)="onClickResult(i)"
          ></div>
        </li>
      </ul>

      <ul
        #searchHistoryEl
        class="autocomplete-result"
        [ngClass]="{ 'is-visible': isSearchHistoryVisible }"
        [ngStyle]="{ 'max-height': maxHeight }"
      >
        <li *ngIf="!!historyHeading" class="autocomplete-resultTitle">
          <div
            [innerHtml]="sanitize(historyHeading)"
            class="resultTitleText"
          ></div>
          <!--
          <div
            (click)="onClickResetHistory()"
            class="autocomplete-historyTrash"
          ></div>
          -->
        </li>
        <li
          *ngFor="let result of searchHistory;let i = index"
          class="autocomplete-item"
          [ngClass]="{ 'is-focus': result.isFocus === true }"
        >
          <div
            [innerHtml]="sanitize(result.markup || result.text)"
          >
          </div>
          <div class="itemClickLayer"
            (mouseover)="onMouseOverResultItem(i)"
            (click)="onClickResult(i)"
          ></div>
          <span class="autocomplete-iconWrapper is-visible" (click)="onDeleteHistoryItem(i)">
            <span class="autocomplete-icon deleteIcon">✕</span>
          </span>
        </li>

        <!--
        <li
          *ngIf="!searchHistory.length"
          class="autocomplete-item"
        >no search history</li>
        -->
      </ul>
    </div>
  `,
  styles: [
    `
    .autocomplete {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      padding: 0 0.75em;
      width: 100%;
      height: 35px;
      line-height: 35px;
      color: inherit;
      font-size: inherit;
      border-width: 1px;
      border-style: solid;
      border-radius: 2px;
      border-color: #ddd;
    }

    .autocomplete-input {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: calc(100% - 2px);
      height: calc(100% - 2px);
      line-height: inherit;
      padding: inherit;
      border: 0;
      background: none;
      font-size: inherit;
      font-weight: inherit;
      color: inherit;
      outline-width: 0;
    }

    .autocomplete-input.is-selected {
      display: block;
    }

    .autocomplete-result {
      box-sizing: border-box;
      display: block;
      opacity: 0;
      z-index: -999;
      position: absolute;
      top: 100%;
      left: -1px;
      width: calc(100% + 2px);
      padding: 0.5em 0;
      margin: 0;
      max-height: 20em;
      overflow: auto;
      border-style: solid;
      border-width: 1px;
      border-radius: inherit;
      border-color: inherit;
      background-color: #fff;
      list-style: none;
      box-shadow: 0 2px 0px rgba(0, 0, 0, 0.1);
      font-size: inherit;
    }

    .autocomplete-result.is-visible {
      display: block;
      opacity: 1;
      z-index: 100;
    }

    .autocomplete-item {
      line-height: 1.4 !important;
      position: relative;
      padding: 0.5em 0.75em;
      padding-right: 2.25em;
      max-height: 200px;
    }

    .autocomplete-item.is-focus {
      background-color: #eee;
    }

    .autocomplete-item:hover {
      cursor: pointer;
    }

    .autocomplete-iconWrapper {
      display: none;
      position: absolute;
      z-index: 10;
      top: 0%;
      right: 0.5em;
      width: 1.75em;
      height: 100%;
      padding: 0 0.5em;
      text-align: center;
      background: none;
      border-radius: inherit;
    }

    .autocomplete-iconWrapper.is-visible {
      display: block;
    }

    .autocomplete-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -47%);
      opacity: 0.3;
    }

    .autocomplete-icon.deleteIcon:hover {
      opacity: 1;
      cursor: pointer;
    }

    .autocomplete-iconWrapper:hover {
      cursor: pointer;
    }

    .autocomplete-isLoading {
      z-index: 20;
    }

    .autocomplete-closeBtn {
      transition: all 0.2s ease-in-out;
    }

    .autocomplete-closeBtn:hover {
      cursor: pointer;
      transform: scale(1.5);
    }

    .autocomplete-resultTitle {
      padding: 0 0.75em;
    }

    .autocomplete-resultTitle > .resultTitleText {
      padding: 0.3em 0;
      font-size: 0.85em;
      line-height: 1.4;
      border-bottom: 1px solid rgba(230, 230, 230, 0.7);
    }

    .autocomplete-historyTrash {
      float: right;
      transition: all 0.2s ease-in-out;
    }

    .autocomplete-historyTrash:hover {
      cursor: pointer;
      transform: scale(1.5);
    }

    .autocomplete-deleteHistoryItemBtn {
      z-index: 10;
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      width: 1.5em;
      display: block;
      color: #3b4752;
      opacity: 0.3;
      transition: all 0.2s ease-in-out;
      font-size: 1em;
      text-align: center;
    }

    .autocomplete-deleteHistoryItemBtn:hover {
      opacity: 1;
      cursor: pointer;
    }

    .autocomplete-deleteHistoryItemBtn:hover > i {
      transform: scale(1.5);
    }

    .sk-fading-circle {
      width: 1.2em;
      height: 1.2em;
      position: relative;
    }

    .sk-fading-circle .sk-circle {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
    }

    .sk-fading-circle .sk-circle:before {
      content: '';
      display: block;
      margin: 0 auto;
      width: 15%;
      height: 15%;
      background-color: #333;
      border-radius: 100%;
      -webkit-animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
              animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
    }
    .sk-fading-circle .sk-circle2 {
      -webkit-transform: rotate(30deg);
          -ms-transform: rotate(30deg);
              transform: rotate(30deg);
    }
    .sk-fading-circle .sk-circle3 {
      -webkit-transform: rotate(60deg);
          -ms-transform: rotate(60deg);
              transform: rotate(60deg);
    }
    .sk-fading-circle .sk-circle4 {
      -webkit-transform: rotate(90deg);
          -ms-transform: rotate(90deg);
              transform: rotate(90deg);
    }
    .sk-fading-circle .sk-circle5 {
      -webkit-transform: rotate(120deg);
          -ms-transform: rotate(120deg);
              transform: rotate(120deg);
    }
    .sk-fading-circle .sk-circle6 {
      -webkit-transform: rotate(150deg);
          -ms-transform: rotate(150deg);
              transform: rotate(150deg);
    }
    .sk-fading-circle .sk-circle7 {
      -webkit-transform: rotate(180deg);
          -ms-transform: rotate(180deg);
              transform: rotate(180deg);
    }
    .sk-fading-circle .sk-circle8 {
      -webkit-transform: rotate(210deg);
          -ms-transform: rotate(210deg);
              transform: rotate(210deg);
    }
    .sk-fading-circle .sk-circle9 {
      -webkit-transform: rotate(240deg);
          -ms-transform: rotate(240deg);
              transform: rotate(240deg);
    }
    .sk-fading-circle .sk-circle10 {
      -webkit-transform: rotate(270deg);
          -ms-transform: rotate(270deg);
              transform: rotate(270deg);
    }
    .sk-fading-circle .sk-circle11 {
      -webkit-transform: rotate(300deg);
          -ms-transform: rotate(300deg);
              transform: rotate(300deg);
    }
    .sk-fading-circle .sk-circle12 {
      -webkit-transform: rotate(330deg);
          -ms-transform: rotate(330deg);
              transform: rotate(330deg);
    }
    .sk-fading-circle .sk-circle2:before {
      -webkit-animation-delay: -1.1s;
              animation-delay: -1.1s;
    }
    .sk-fading-circle .sk-circle3:before {
      -webkit-animation-delay: -1s;
              animation-delay: -1s;
    }
    .sk-fading-circle .sk-circle4:before {
      -webkit-animation-delay: -0.9s;
              animation-delay: -0.9s;
    }
    .sk-fading-circle .sk-circle5:before {
      -webkit-animation-delay: -0.8s;
              animation-delay: -0.8s;
    }
    .sk-fading-circle .sk-circle6:before {
      -webkit-animation-delay: -0.7s;
              animation-delay: -0.7s;
    }
    .sk-fading-circle .sk-circle7:before {
      -webkit-animation-delay: -0.6s;
              animation-delay: -0.6s;
    }
    .sk-fading-circle .sk-circle8:before {
      -webkit-animation-delay: -0.5s;
              animation-delay: -0.5s;
    }
    .sk-fading-circle .sk-circle9:before {
      -webkit-animation-delay: -0.4s;
              animation-delay: -0.4s;
    }
    .sk-fading-circle .sk-circle10:before {
      -webkit-animation-delay: -0.3s;
              animation-delay: -0.3s;
    }
    .sk-fading-circle .sk-circle11:before {
      -webkit-animation-delay: -0.2s;
              animation-delay: -0.2s;
    }
    .sk-fading-circle .sk-circle12:before {
      -webkit-animation-delay: -0.1s;
              animation-delay: -0.1s;
    }

    @-webkit-keyframes sk-circleFadeDelay {
      0%, 39%, 100% { opacity: 0; }
      40% { opacity: 1; }
    }

    @keyframes sk-circleFadeDelay {
      0%, 39%, 100% { opacity: 0; }
      40% { opacity: 1; }
    }

    .itemClickLayer {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      opacity: 0;
    }`,
  ],
})
class Ng2SimpleAutocomplete implements OnInit, OnChanges {
  // 검색 입력 텍스트. 부모 컴포넌트에서 banana-in-box ([]) 표기법 사용해서 연결
  // ex) [(search)]="searchText"
  @Input()
  get search() {
    return this._search;
  }
  set search(v) {
    this._search = v;
    this.searchChange.emit(v);
  }
  @Output() searchChange = new EventEmitter(); // search 2-way binding

  // required input
  // ------------------------------------------------------------------------
  @Input() searchResults: AutoCompleteItem[] = [];
  @Output() onChangeInput = new EventEmitter(); // 검색어 입력 변경
  @Output() onSelect = new EventEmitter(); // 검색 결과 항목 선택 콜백

  // optional
  // ------------------------------------------------------------------------
  @Output() onReset = new EventEmitter(); // 입력 값 초기화 콜백
  /**
   * apply 3rd-party/custom class(es) for input
   *
   * @type {Boolean}
   * @memberof Ng2SimpleAutocomplete
   */
  @Input() useCSSFramework = false;

  /**
   * specify which 3rd-party/custom class(es) to apply to the input
   *
   * @type {String}
   * @memberof Ng2SimpleAutocomplete
   */
  @Input() frameworkInputStyle: String = '';
  /**
   * if searchResult is static list, list will be filtered when input changes
   * @memberof Ng2SimpleAutocomplete
   */
  @Input() isStatic = false;
  /**
   * input placeholder
   *
   * @memberof Ng2SimpleAutocomplete
   */
  @Input() placeholder = 'search keyword';
  /**
   * shows loading spinner when this is true value.
   *
   * @type {Boolean}
   * @memberof Ng2SimpleAutocomplete
   */
  @Input() isLoading: Boolean;

  /**
   * When valid historyId is given, then component stores selected item.
   * History result is visible at least 1 history item is stored.
   *
   * @type {String}
   * @memberof Ng2SimpleAutocomplete
   */
  @Input() historyId: String;

  /**
   * heading text of history result.
   * if it is null then history heading will be hide.
   *
   * @memberof Ng2SimpleAutocomplete
   */
  @Input() historyHeading = 'Recently selected';
  @Input() maxHistory = 15;
  @Input() autoFocusOnFirst = true; // autofocus on first result item
  @Input() resetOnDelete = false; // invoke onReset event binding on delete
  @Input() resetOnFocusOut = false; // invoke onReset event binding on focusout
  @Input() noResultText = 'There is no results'; // text when there is no search result.

  /**
   * style object. it overwrites basic style of input element by [ngStyle] binding.
   *
   * ex)
   * const inputStyle = {
   *  'width': '300px',
   *  'font-size': '20px',
   *  'padding': '0 20px'
   * }
   * @memberof Ng2SimpleAutocomplete
   */
  @Input()
  style: AutocompleteStyle = {
    width: '100%',
    color: 'inherit',
    'font-size': 'inherit',
    'border-radius': '2px',
    'border-color': '#ddd',
    height: '35px',
    'line-height': '35px',
  };

  // 컴포넌트 변수
  // ------------------------------------------------------------------------
  _search = ''; // 검색 입력 텍스트
  _searchResults: AutoCompleteItem[] = [];
  filteredResults: AutoCompleteItem[] = [];
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchResultsEl') searchResultsEl: ElementRef;
  @ViewChild('searchHistoryEl') searchHistoryEl: ElementRef;
  inputKeyUp$: Observable<any>; // 검색 입력 이벤트
  inputKeyDown$: Observable<any>; // 검색 입력 이벤트
  isFocusIn: Boolean;
  searchHistory: AutoCompleteItem[] = []; // 검색 히스토리
  isNoResults = false; // 검색 결과 존재 여부. 알 수 없는 경우도 false로 할당한다.
  isResultSelected = false; // 검색 결과 선택 여부
  maintainFocus: boolean; // 포커스아웃시 강제로 포커스를 유지하고 싶을 때 사용한다.
  fontSize = <any>{}; // font-size style extracted from inputStyle
  maxHeight: string; // max height of list. default 20em.

  get inputClasses() {
    return `${this.isResultSelected ? 'is-selected' : ''} ${this.useCSSFramework
      ? this.frameworkInputStyle
      : 'autocomplete-input'}`;
  }

  // 초기화 버튼 표시 여부
  get isResetButtonVisible(): Boolean {
    return !!this.search && !this.isLoading;
  }

  get isInputExist() {
    return this.isFocusIn && !!removeSpace(this.search);
  }

  get isResultExists() {
    const result = R.not(this.isStatic)
      ? this.searchResults.length
      : this.filteredResults.length;
    return !!result;
  }

  // 결과 목록 표시 여부
  get isResultVisible(): Boolean {
    return (
      this.isFocusIn &&
      !this.isSearchHistoryVisible && // history has higher priority
      !this.isLoading &&
      this.isResultExists
    );
  }

  /**
   * check if history list is visible
   *
   * @readonly
   * @type {Boolean}
   * @memberof Ng2SimpleAutocomplete
   */
  get isSearchHistoryVisible(): Boolean {
    return (
      this.isFocusIn &&
      !!this.historyId && // history id is required
      this.searchHistory.length &&
      !this.isInputExist &&
      !this.isLoading &&
      !this.isNoResults
    );
  }

  // 검색 결과와 히스토리 중에서 표시된 목록 선택
  get searchResultsOnVisble(): AutoCompleteItem[] {
    if (this.isResultVisible) {
      return R.not(this.isStatic) ? this.searchResults : this.filteredResults;
    }

    if (this.isSearchHistoryVisible) {
      return this.searchHistory;
    }

    return [];
  }

  get isNoResultsVisible() {
    return this.isFocusIn && this.isNoResults;
  }

  constructor(public sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.searchResults = this.searchResults || [];
    this.initEventStream();

    if (this.historyId) {
      this.initSearchHistory();
    }

    this.extractStyle(this.style);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 검색 결과가 업데이트된 경우
    if (
      changes &&
      changes.searchResults &&
      Array.isArray(changes.searchResults.currentValue)
    ) {
      this.searchResults = changes.searchResults.currentValue.map((v, index) => {
        // focus on first result item
        return this.autoFocusOnFirst && index === 0
          ? Object.assign(v, { isFocus: true })
          : v;
      });

      if (!changes.searchResults.firstChange) {
        this.isNoResults = !this.searchResults.length;
      }

      // save result as filteredResult for filtering
      if (this.isStatic) {
        this.filteredResults = this.searchResults.slice();
      }
    }
  }

  extractStyle(style = {}) {
    const inputStyle = Object.assign({}, style);
    this.style = {
      width: inputStyle['width'],
      color: inputStyle['color'],
      'font-size': inputStyle['font-size'],
      'border-radius': inputStyle['border-radius'],
      'border-color': inputStyle['border-color'],
      height: inputStyle['height'],
      'line-height': inputStyle['line-height'],
    };

    this.maxHeight = inputStyle['max-height-of-list'] || '20em';
  }

  initSearchHistory() {
    const history = window.localStorage.getItem(
      `ng2_simple_autocomplete_history_${this.historyId}`
    );
    this.searchHistory = history ? JSON.parse(history) : [];
  }

  initEventStream() {
    this.inputKeyUp$ = Observable.fromEvent(this.searchInput.nativeElement, 'keyup').map(
      (e: any) => e
    );

    this.inputKeyDown$ = Observable.fromEvent(
      this.searchInput.nativeElement,
      'keydown'
    ).map((e: any) => e);

    this.listenEventStream();
  }

  listenEventStream() {
    // key up event
    this.inputKeyUp$
      .filter(
        e =>
          !isArrowUpDown(e.keyCode) &&
          !isEnter(e.keyCode) &&
          !isESC(e.keyCode) &&
          !isTab(e.keyCode)
      )
      .debounceTime(400)
      .subscribe(e => {
        this.onKeyUp(e);
      });

    // ESC
    this.inputKeyUp$
      .filter(e => isESC(e.keyCode))
      .debounceTime(100)
      .subscribe(e => {
        this.onEsc();
      });

    // enter
    this.inputKeyUp$.filter(e => isEnter(e.keyCode)).subscribe(e => {
      this.onEnterResult(e);
    });

    // cursor up & down
    this.inputKeyDown$.filter(e => isArrowUpDown(e.keyCode)).subscribe(e => {
      e.preventDefault();
      this.onFocusNextResult(e);
    });

    // delete
    this.inputKeyDown$
      .filter(e => isBackspace(e.keyCode) || isDelete(e.keyCode))
      .subscribe(e => {
        this.onDeleteSearchText();
      });
  }

  /**
   * on keyup == when input changed
   * @param e event
   */
  onKeyUp(e) {
    this.isResultSelected = false;
    this.isFocusIn = true;
    this.isNoResults = false; // 입력중 검색결과는 알 수 없음
    this.search = e.target.value; // 2 way binding된 검색 키워드 업데이트

    // if static result, filter result by input text
    if (!this.isStatic) {
      this.searchResults = []; // reset search results
    } else {
      this.filterStaticResult(this.search);
    }

    if (!isEmptyString(this.search)) {
      this.onChangeInput.emit(e.target.value); // 검색 키워드 변경시 상위 컴포넌트에서 콜백 실행
    }
  }

  filterStaticResult(search) {
    if (isEmptyString(search)) {
      this.filteredResults = this.searchResults.slice();
      return;
    }

    this.filteredResults = this.searchResults.filter(v => v.text.indexOf(search) > -1);
    if (R.not(this.filteredResults.length)) {
      this.isNoResults = true;
    }
  }

  /**
   * 키보드 상하 입력
   */
  onFocusNextResult(e) {
    this.isFocusIn = true;
    const results = this.searchResultsOnVisble;
    const resultLength = results.length;
    const focusIdx = results.findIndex((result: AutoCompleteItem) => result.isFocus);
    let nextIdx = isArrowUp(e.keyCode) ? focusIdx - 1 : focusIdx + 1;

    nextIdx = nextIdx % resultLength;
    nextIdx = nextIdx < 0 ? resultLength - 1 : nextIdx;

    if (nextIdx > -1) {
      this.setFocusedResult(nextIdx);
      this.scrollToFocusedItem(nextIdx);
    }
  }

  /**
   * 포커스된 아이템으로 스크롤한다.
   *
   * @param {any} index 결과 아이템 인덱스
   *
   * @memberOf AutocompleteComponent
   */
  scrollToFocusedItem(index) {
    const listEl = this.isResultVisible
      ? this.searchResultsEl.nativeElement
      : this.searchHistoryEl.nativeElement;

    let items = Array.prototype.slice.call(listEl.childNodes);
    items = items.filter((node: any) => {
      if (node.nodeType === 1) {
        // if element node
        return node.className.includes('autocomplete-item');
      } else {
        return false;
      }
    });

    if (!items.length) {
      return;
    }

    const listHeight = listEl.offsetHeight;
    const itemHeight = items[index].offsetHeight;
    const visibleTop = listEl.scrollTop; // 표시영역 top
    const visibleBottom = listEl.scrollTop + listHeight - itemHeight; // 표시영역 bottom
    const targetPosition = items[index].offsetTop; // 이동할 위치

    // 아이템 위치가 표시 영역 위일 경우
    if (targetPosition < visibleTop) {
      listEl.scrollTop = targetPosition;
    }
    // 아이템 위치가 표시 영역 아래일 경우
    if (targetPosition > visibleBottom) {
      listEl.scrollTop = targetPosition - listHeight + itemHeight;
    }
  }

  /**
   * 검색 결과에 마우스오버
   * @param {[number]} index [searchResults 배열의 인덱스]
   */
  onMouseOverResultItem(index: number) {
    this.setFocusedResult(index);
  }

  /**
   * 하이라이트된 입력을 수정한다.
   * @param {[number]} focusIdx [searchResults 배열에서 하이라이트할 인덱스]
   */
  setFocusedResult(focusIdx: number) {
    let results = this.searchResultsOnVisble;

    results = results.map((result, idx) => {
      if (idx === focusIdx) {
        return Object.assign(result, { isFocus: true });
      } else {
        return Object.assign(result, { isFocus: false });
      }
    });
  }

  /**
   * 검색 결과를 마우스로 직접 선택
   */
  onClickResult(index) {
    const results = this.searchResultsOnVisble;
    this.emitResult(results[index]);
    this.isFocusIn = false;
  }

  /**
   * 자동완성 결과 엔터키 선택
   */
  onEnterResult(e) {
    // 로딩중에는 입력되지 않도록
    if (this.isLoading) {
      return;
    }

    const results = this.searchResultsOnVisble;
    const focusedIdx = results.findIndex((result: AutoCompleteItem) => result.isFocus);
    const focused = results[focusedIdx];
    const unselected =
      !this.autoFocusOnFirst || !this.search ? { text: this.search, value: null } : null;
    // 자동포커스 옵션이 false인 경우에만 선택되지 않은 값을 전달한다.
    const selected = focused || unselected;

    if (!R.isNil(selected)) {
      this.isFocusIn = false;
      this.emitResult(selected);
    }
  }

  onEsc() {
    this.isFocusIn = false;

    if (this.resetOnDelete) {
      this.onResetSearchText();
    }
  }

  /**
   * onSelect 콜백 호출
   * @param selected
   */
  emitResult(selected: AutoCompleteItem) {
    this.isResultSelected = true;
    this.search = selected.text; // 입력 텍스트 변경
    this.searchChange.emit(selected.text); // 2-way binding
    this.onSelect.emit(selected);

    const isValidText = R.compose(R.not, R.both(isEmptyString, R.isNil))(
      selected.text || selected.markup
    );

    const isValidHistoryId = R.identity(this.historyId);

    if (isValidText && isValidHistoryId) {
      this.saveHistory(selected);
    }
  }

  /**
   * 키보드 화살표 위 입력일때 텍스트 인풋에서 커서가 맨 앞으로 이동하는 기본 동작 방지
   * @param {[type]} e [description]
   */
  preventCursorPosition(e) {
    if (isArrowUpDown(e.keyCode)) {
      e.preventDefault();
    }
  }

  onFocusout(e) {
    // click 보다 focusout 이벤트가 먼저 발생하기 때문에 목록을 클릭할 수 있게 딜레이를 준다.
    setTimeout(() => {
      // 선택되지 않은 상태에서 focusout이 발생한다면 초기화한다.
      if (!this.isResultSelected && this.resetOnFocusOut) {
        this.onResetSearchText();
      }

      // 강제로 유지하지 않을 경우에만 포커스를 아웃시킨다
      if (!this.maintainFocus) {
        this.isFocusIn = false;
      } else {
        // 강제 유지할 경우 다시 input 태그에 포커스를 준다.
        this.searchInput.nativeElement.focus();
        this.maintainFocus = false;
      }
    }, 300);
  }

  onFocusin() {
    this.isFocusIn = true;
    this.isNoResults = false;
  }

  /**
   * 검색 입력 텍스트 초기화(우측 x버튼 클릭)
   */
  onResetSearchText() {
    this.search = '';
    this.isFocusIn = false; // 검색 결과 및 히스토리 닫기
    this.isNoResults = false;

    // if static list, init the list
    if (this.isStatic) {
      this.filterStaticResult('');
    }

    if (this.onReset) {
      this.onReset.emit();
    }
  }

  onDeleteSearchText() {
    if (this.resetOnDelete) {
      this.onResetSearchText();
    }
  }

  /**
   * 검색 기록을 local storage에 저장
   */
  saveHistory(selected: AutoCompleteItem) {
    this.searchHistory = R.pipe(
      R.map(v => Object.assign(v, { isFocus: false })),
      R.uniqWith(R.equals),
      R.take(this.maxHistory)
    )(R.flatten([selected, this.searchHistory]));

    this.saveHistoryToLocalStorage(this.searchHistory);
  }

  onClickResetHistory() {
    this.searchHistory = [];
    this.saveHistoryToLocalStorage(this.searchHistory);
  }

  onDeleteHistoryItem(index: number) {
    this.maintainFocus = true; // 클릭시 focusout되기 때문에 포커스 유지를 위한 플래그 설정
    this.searchHistory = this.searchHistory.filter((v, i) => i !== index);
    this.saveHistoryToLocalStorage(this.searchHistory);
  }

  saveHistoryToLocalStorage(history) {
    window.localStorage.setItem(
      `ng2_simple_autocomplete_history_${this.historyId}`,
      JSON.stringify(history)
    );
  }

  sanitize(markup: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  }
}

export { Ng2SimpleAutocomplete, AutocompleteStyle, AutoCompleteItem };
