import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  Sanitizer,
  SecurityContext,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/debounceTime';

// import { find, findIndex } from 'lodash';
import R from 'ramda';

const isArrowUp = (keyCode) => keyCode === 38;
const isArrowDown = (keyCode) => keyCode === 40;
const isArrowUpDown = (keyCode) => isArrowUp(keyCode) || isArrowDown(keyCode);
const isEnter = (keyCode) => keyCode === 13;
const isBackspace = (keyCode) => keyCode === 8;
const isDelete = (keyCode) => keyCode === 46;
const isESC = (keyCode) => keyCode === 27;
const isTab = (keyCode) => keyCode === 9;
const isEmptyString = (str = '') => str.replace(/\s/g, '') === '';
const removeSpace = (str = '') => {
  if (typeof str === 'string') {
    return str.replace(/\s/g, '');
  }
  return str;
};

export interface AutoCompleteResult {
  value: any;         // 값
  text?: string;       // 표시 텍스트
  markup?: string;    // 표시 텍스트 마크업.
  isFocus?: boolean;  // 포커스 여부
}

@Component({
  selector: 'ng2-simple-autocomplete',
  template: `
    <div
      class="autocomplete"
      [ngStyle]="inputStyle"
    >
      <input
        #searchInput
        [(ngModel)]="_search"
        class="autocomplete-input"
        [ngClass]="isResultSelected && 'is-selected'"
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
        (click)="onResetSearchText()"
      >
        <span class="resetIcon" [ngStyle]="fontSize">✕</span>
      </div>

      <!--
      <div
        [ngClass]="{ 'autocomplete-iconWrapper': true, 'is-visible': isLoading}"
        (click)="onResetSearchText()"
      >
        <i class="icon--refresh">↻</i>
      </div>
      -->

      <div [ngClass]="{ 'is-visible': isNoResultsVisible }" class="autocomplete-result">
        {{ noResultText }}
      </div>

      <ul
        #searchResultsEl
        [ngClass]="{ 'is-visible': isResultVisible }"
        class="autocomplete-result"
      >
        <li
          class="autocomplete-item"
          *ngFor="let result of searchResults;let i = index"
          [ngClass]="{ 'is-focus': result.isFocus === true }"
          (click)="onClickResult(i)"
          (mouseover)="onMouseOverResultItem(i)"
          [innerHtml]="result.text || sanitizer.bypassSecurityTrustHtml(result.markup)"
        ></li>
      </ul>

      <ul
        #searchHistoryEl
        class="autocomplete-result"
        [ngClass]="{ 'is-visible': isSearchHistoryVisible }"
      >
        <li class="autocomplete-resultTitle">
          <span>최근 검색</span>
          <span
            (click)="onClickResetHistory()"
            class="autocomplete-historyTrash"
          >
            <i class="fa fa-trash-o"></i>
          </span>
        </li>
        <li
          *ngFor="let result of searchHistory;let i = index"
          class="autocomplete-item"
          [ngClass]="{ 'is-focus': result.isFocus === true }"
        >
          <div
            (click)="onClickResult(i, $event)"
            (mouseover)="onMouseOverResultItem(i)"
            [innerHtml]="result.text || sanitizer.bypassSecurityTrustHtml(result.markup)"
          >
          </div>
          <span class="autocomplete-deleteHistoryItemBtn" (click)="onDeleteHistoryItem(i)">
            <i class="fa fa-minus-square-o"></i>
          </span>
        </li>

        <li
          *ngIf="!searchHistory.length"
          class="autocomplete-item"
        >검색 이력이 없습니다.</li>
      </ul>
    </div>
  `,
  styles: [`
    .autocomplete {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      padding: 0 1.5em 0 0.5em;
      height: 35px;
      line-height: 35px;
      border: 1px solid #ddd;
    }

    .autocomplete-input {
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: inherit;
      height: inherit;
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
      display: none;
      position: absolute;
      z-index: 100;
      top: 100%;
      left: 0;
      width: 100%;
      padding: 8px;
      margin: 0;
      max-height: 400px;
      overflow: auto;
      border: inherit;
      background-color: #fff;
      list-style: none;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
    }

    .autocomplete-result.is-visible {
      display: block;
    }

    .autocomplete-result > li {
      line-height: 1.4 !important;
    }

    .autocomplete-item {
      position: relative;
      padding: 8px;
      padding-right: 24px;
      max-height: 200px;
    }

    .autocomplete-item.is-focus {
      background-color: #eee;
    }

    .autocomplete-item:hover {
      cursor: pointer;
    }

    .autocomplete-iconWrapper {
      position: absolute;
      z-index: 10;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      display: none;
      width: 30px;
      height: 100%;
      padding: 0 5px;
      font-size: 14px;
      text-align: center;
      background: white;
    }

    .autocomplete-iconWrapper.is-visible {
      display: block;
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
      padding: 5px 8px;
      font-size: 0.9em;
      font-weight: bold;
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
      width: 30px;
      font-size: 14px;
      text-align: right;
      display: block;
      color: #3b4752;
      padding: 8px;
      opacity: 0.3;
      font-size: 0.9em;
      transition: all 0.2s ease-in-out;
    }

    .autocomplete-deleteHistoryItemBtn:hover {
      opacity: 1;
      cursor: pointer;
    }

    .autocomplete-deleteHistoryItemBtn:hover > i {
      transform: scale(1.5);
    }
  `],
})
export class Ng2SimpleAutocomplete implements OnInit {
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
  @Output() searchChange = new EventEmitter();  // search 2-way binding

  // required input
  @Input() searchResults: AutoCompleteResult[] = [];  // 검색 결과 리스트
  @Output() onChangeInput = new EventEmitter(); // 검색어 입력 변경
  @Output() onSelect = new EventEmitter();      // 검색 결과 항목 선택 콜백

  // optional
  @Output() onReset = new EventEmitter();       // 입력 값 초기화 콜백
  @Input() placeholder = 'placeholder';
  @Input() isLoading: Boolean;                  // 목록 비동기 로드중 여부
  @Input() historyId: String;                   // 검색 히스토리 아이디. 명시되면 최근 검색 키워드를 표시한다.
  @Input() searchResultsTotal: Number;          // 전체 검색 결과 수
  @Input() autoFocusOnFirst = true;             // 첫번째 항목에 자동 포커스
  @Input() resetOnDelete = false;               // 검색 텍스트 삭제시 onReset 이벤트 호출
  @Input() resetOnFocusOut = false;               // 검색 텍스트 삭제시 onReset 이벤트 호출
  @Input() saveHistoryOnChange = false;
  @Input() noResultText = 'There is no results';
  @Input() inputStyle = {
    'font-size': 'inherit',
  };

  // 컴포넌트 변수
  _search = ''; // 검색 입력 텍스트
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('searchResultsEl') searchResultsEl: ElementRef;
  @ViewChild('searchHistoryEl') searchHistoryEl: ElementRef;
  inputKeyUp$: Observable<any>;               // 검색 입력 이벤트
  inputKeyDown$: Observable<any>;             // 검색 입력 이벤트
  isFocusIn: Boolean;
  searchHistory: AutoCompleteResult[] = [];   // 검색 히스토리
  HISTORY_MAX_LENGTH = 15;
  isNoResults = false;                        // 검색 결과 존재 여부. 알 수 없는 경우도 false로 할당한다.
  isResultSelected = false;                   // 검색 결과 선택 여부
  maintainFocus: boolean;                     // 포커스아웃시 강제로 포커스를 유지하고 싶을 때 사용한다.
  fontSize = <any>{};

  // 초기화 버튼 표시 여부
  get isResetButtonVisible(): Boolean {
    return !!this.search && !this.isLoading;
  }

  get isInputExist() {
    return this.isFocusIn && !!removeSpace(this.search);
  }

  // 결과 목록 표시 여부
  get isResultVisible(): Boolean {
    return this.isFocusIn && !this.isLoading && !!this.searchResults.length && this.isInputExist;
  }

  // 검색 히스토리 표시 여부
  get isSearchHistoryVisible(): Boolean {
    return this.isFocusIn &&
      !this.isInputExist &&
      !this.isLoading &&
      // !this.searchResults.length &&
      !!this.historyId &&
      !this.isNoResults;
  }

  // 검색 결과와 히스토리 중에서 표시된 목록 선택
  get searchResultsOnVisble(): AutoCompleteResult[] {
    if (this.isResultVisible) {
      return this.searchResults;
    }
    if (this.isSearchHistoryVisible) {
      return this.searchHistory;
    }

    return [];
  }

  get isNoResultsVisible() {
    return this.isFocusIn && this.isNoResults;
  }

  constructor(
    public sanitizer: DomSanitizer
  ){}

  ngOnInit() {
    this.searchResults = this.searchResults || [];
    this.initEventStream();

    if (this.historyId) {
      this.initSearchHistory();
    }

    this.fontSize = Object.assign({}, {
      'font-size': this.inputStyle['font-size'] || 'inherit',
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    // 검색 결과가 업데이트된 경우
    if (changes &&
      changes.searchResults &&
      Array.isArray(changes.searchResults.currentValue)
    ) {
      this.searchResults = changes.searchResults.currentValue.map((v, index) => {
        // 첫번째 아이템 포커스
        return (this.autoFocusOnFirst && index === 0) ? Object.assign(v, { isFocus: true }) : v;
      });
    }

    // 검색 키워드 없을 경우 결과 초기화
    if (changes['search']) {
      if (!changes['search'].currentValue) {
        this.searchResults = [];
      }
    }

    // 검색 결과 확인
    if (changes['isLoading']) {
      this.isNoResults = false; // 기본적으로 결과는 알수없음
      const isLoadingChange = changes['isLoading'];

      // 비동기 목록 호출 완료
      if (isLoadingChange.previousValue && !isLoadingChange.currentValue) {
        if (!this.searchResults.length) {
          this.isNoResults = true;
        } else {
          this.isNoResults = false;
        }
      }
    }
  }

  initSearchHistory() {
    const history = window.localStorage
      .getItem(`ng2_simple_autocomplete_history_${this.historyId}`);
    this.searchHistory = history ? JSON.parse(history) : [];
    console.log('this.searchHistory', this.searchHistory);
  }

  initEventStream() {
    this.inputKeyUp$ = Observable.fromEvent(this.searchInput.nativeElement, 'keyup')
      .map((e: any) => e);

    this.inputKeyDown$ = Observable.fromEvent(this.searchInput.nativeElement, 'keydown')
      .map((e: any) => e);

    this.listenEventStream();
  }

  listenEventStream() {
    // key up event
    this.inputKeyUp$
      .filter(e =>
        !isArrowUpDown(e.keyCode) &&
        !isEnter(e.keyCode) &&
        !isESC(e.keyCode) &&
        !isTab(e.keyCode)
      )
      .debounceTime(400)
      .subscribe((e) => {
        this.onKeyUp(e);
      });

    // ESC
    this.inputKeyUp$
      .filter(e => isESC(e.keyCode))
      .debounceTime(100)
      .subscribe((e) => {
        this.onEsc();
      });

    // enter
    this.inputKeyUp$
      .filter(e => isEnter(e.keyCode))
      .subscribe((e) => {
        this.onEnterResult(e);
      });

    // cursor up & down
    this.inputKeyDown$
      .filter(e => isArrowUpDown(e.keyCode))
      .subscribe((e) => {
        e.preventDefault();
        this.onFocusNextResult(e);
      });

    // delete
    this.inputKeyDown$
      .filter(e => isBackspace(e.keyCode) || isDelete(e.keyCode))
      .subscribe((e) => {
        this.onDeleteSearchText();
      });
  }

  onKeyUp(e) {
    this.isResultSelected = false;
    this.isFocusIn = true;
    this.isNoResults = false; // 입력중 검색결과는 알 수 없음
    this.search = e.target.value; // 2 way binding된 검색 키워드 업데이트
    this.onChangeInput.emit(e.target.value); // 검색 키워드 변경시 상위 컴포넌트에서 콜백 실행

    if (this.saveHistoryOnChange && !isEmptyString(this.search)) {
      this.saveHistory({ text: this.search, value: null });
    }
  }

  /**
   * 키보드 상하 입력
   */
  onFocusNextResult(e) {
    const results = this.searchResultsOnVisble;

    this.isFocusIn = true;
    const resultLength = results.length;
    const focusIdx = results.findIndex((result: AutoCompleteResult) => result.isFocus);
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
    const listEl = this.isResultVisible ?
      this.searchResultsEl.nativeElement : this.searchHistoryEl.nativeElement;

    let items = Array.prototype.slice.call(listEl.childNodes);
    items = items.filter((node: any) => {
      if (node.nodeType === 1) { // if element node
        return node.className.includes('autocomplete-item');
      } else  {
        return false;
      }
    });

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
  onClickResult(index, e) {
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
    const focusedIdx = results.findIndex((result: AutoCompleteResult) => result.isFocus);
    const focused = results[focusedIdx];
    const unselected = (!this.autoFocusOnFirst || !this.search) ?
      { text: this.search, value: null } : null;
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
  emitResult(selected: AutoCompleteResult) {
    this.isResultSelected = true;
    this.search = selected.text; // 입력 텍스트 변경
    this.searchChange.emit(selected.text); // 2-way binding
    this.onSelect.emit(selected);

    const isValidText = R.compose(
      R.not,
      R.both(isEmptyString, R.isNil)
    )(selected.text || selected.markup);

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
  }

  /**
   * 검색 입력 텍스트 초기화(우측 x버튼 클릭)
   */
  onResetSearchText() {
    this.search = '';
    this.isFocusIn = false; // 검색 결과 및 히스토리 닫기
    this.isNoResults = false;

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
  saveHistory(selected: AutoCompleteResult) {
    this.searchHistory = R.pipe(
      R.map(v => Object.assign(v, { isFocus: false })),
      R.uniqWith(R.equals),
      R.take(this.HISTORY_MAX_LENGTH)
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
    window.localStorage.setItem(`ng2_simple_autocomplete_history_${this.historyId}`,
      JSON.stringify(history));
  }
}
