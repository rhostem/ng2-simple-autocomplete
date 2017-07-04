"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/fromEvent");
require("rxjs/add/operator/map");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/debounceTime");
var R = require("ramda");
var isArrowUp = function (keyCode) { return keyCode === 38; };
var isArrowDown = function (keyCode) { return keyCode === 40; };
var isArrowUpDown = function (keyCode) { return isArrowUp(keyCode) || isArrowDown(keyCode); };
var isEnter = function (keyCode) { return keyCode === 13; };
var isBackspace = function (keyCode) { return keyCode === 8; };
var isDelete = function (keyCode) { return keyCode === 46; };
var isESC = function (keyCode) { return keyCode === 27; };
var isTab = function (keyCode) { return keyCode === 9; };
var isEmptyString = function (str) {
    if (str === void 0) { str = ''; }
    return str.replace(/\s/g, '') === '';
};
var removeSpace = function (str) {
    if (str === void 0) { str = ''; }
    if (typeof str === 'string') {
        return str.replace(/\s/g, '');
    }
    return str;
};
var Ng2SimpleAutocomplete = (function () {
    function Ng2SimpleAutocomplete(sanitizer) {
        this.sanitizer = sanitizer;
        this.searchChange = new core_1.EventEmitter(); // search 2-way binding
        // required input
        // ------------------------------------------------------------------------
        this.searchResults = [];
        this.onChangeInput = new core_1.EventEmitter(); // 검색어 입력 변경
        this.onSelect = new core_1.EventEmitter(); // 검색 결과 항목 선택 콜백
        // optional
        // ------------------------------------------------------------------------
        this.onReset = new core_1.EventEmitter(); // 입력 값 초기화 콜백
        /**
         * if searchResult is static list, list will be filtered when input changes
         * @memberof Ng2SimpleAutocomplete
         */
        this.isStatic = false;
        /**
         * input placeholder
         *
         * @memberof Ng2SimpleAutocomplete
         */
        this.placeholder = 'search keyword';
        /**
         * heading text of history result.
         * if it is null then history heading will be hide.
         *
         * @memberof Ng2SimpleAutocomplete
         */
        this.historyHeading = 'Recently selected';
        this.autoFocusOnFirst = true; // autofocus on first result item
        this.resetOnDelete = false; // invoke onReset event binding on delete
        this.resetOnFocusOut = false; // invoke onReset event binding on focusout
        this.noResultText = 'There is no results'; // text when there is no search result.
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
        this.style = {
            'width': '100%',
            'color': 'inherit',
            'font-size': 'inherit',
            'border-radius': '2px',
            'border-color': '#ddd',
            'height': '35px',
            'line-height': '35px',
        };
        // 컴포넌트 변수
        // ------------------------------------------------------------------------
        this._search = ''; // 검색 입력 텍스트
        this._searchResults = [];
        this.searchHistory = []; // 검색 히스토리
        this.HISTORY_MAX_LENGTH = 15;
        this.isNoResults = false; // 검색 결과 존재 여부. 알 수 없는 경우도 false로 할당한다.
        this.isResultSelected = false; // 검색 결과 선택 여부
        this.fontSize = {}; // font-size style extracted from inputStyle
        this.filteredResults = [];
    }
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "search", {
        // 검색 입력 텍스트. 부모 컴포넌트에서 banana-in-box ([]) 표기법 사용해서 연결
        // ex) [(search)]="searchText"
        get: function () {
            return this._search;
        },
        set: function (v) {
            this._search = v;
            this.searchChange.emit(v);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "isResetButtonVisible", {
        // 초기화 버튼 표시 여부
        get: function () {
            return !!this.search && !this.isLoading;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "isInputExist", {
        get: function () {
            return this.isFocusIn && !!removeSpace(this.search);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "isResultExists", {
        get: function () {
            var result = R.not(this.isStatic) ? this.searchResults.length : this.filteredResults.length;
            return !!result;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "isResultVisible", {
        // 결과 목록 표시 여부
        get: function () {
            // return true;
            return this.isFocusIn &&
                !this.isSearchHistoryVisible &&
                !this.isLoading &&
                this.isResultExists;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "isSearchHistoryVisible", {
        /**
         * check if history list is visible
         *
         * @readonly
         * @type {Boolean}
         * @memberof Ng2SimpleAutocomplete
         */
        get: function () {
            return this.isFocusIn &&
                !!this.historyId &&
                this.searchHistory.length &&
                !this.isInputExist &&
                !this.isLoading &&
                !this.isNoResults;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "searchResultsOnVisble", {
        // 검색 결과와 히스토리 중에서 표시된 목록 선택
        get: function () {
            if (this.isResultVisible) {
                return R.not(this.isStatic) ? this.searchResults : this.filteredResults;
            }
            if (this.isSearchHistoryVisible) {
                return this.searchHistory;
            }
            return [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ng2SimpleAutocomplete.prototype, "isNoResultsVisible", {
        get: function () {
            return this.isFocusIn && this.isNoResults;
        },
        enumerable: true,
        configurable: true
    });
    Ng2SimpleAutocomplete.prototype.ngOnInit = function () {
        this.searchResults = this.searchResults || [];
        this.initEventStream();
        if (this.historyId) {
            this.initSearchHistory();
        }
        this.extractStyle(this.style);
    };
    Ng2SimpleAutocomplete.prototype.ngOnChanges = function (changes) {
        var _this = this;
        // 검색 결과가 업데이트된 경우
        if (changes &&
            changes.searchResults &&
            Array.isArray(changes.searchResults.currentValue)) {
            this.searchResults = changes.searchResults.currentValue.map(function (v, index) {
                // focus on first result item
                return (_this.autoFocusOnFirst && index === 0) ?
                    Object.assign(v, { isFocus: true }) : v;
            });
            if (!changes.searchResults.firstChange) {
                this.isNoResults = !this.searchResults.length;
            }
            // save result as filteredResult for filtering
            if (this.isStatic) {
                this.filteredResults = this.searchResults.slice();
            }
        }
    };
    Ng2SimpleAutocomplete.prototype.extractStyle = function (style) {
        if (style === void 0) { style = {}; }
        var inputStyle = Object.assign({}, style);
        this.style = {
            'width': inputStyle['width'],
            'color': inputStyle['color'],
            'font-size': inputStyle['font-size'],
            'border-radius': inputStyle['border-radius'],
            'border-color': inputStyle['border-color'],
            'height': inputStyle['height'],
            'line-height': inputStyle['line-height'],
        };
    };
    Ng2SimpleAutocomplete.prototype.initSearchHistory = function () {
        var history = window.localStorage
            .getItem("ng2_simple_autocomplete_history_" + this.historyId);
        this.searchHistory = history ? JSON.parse(history) : [];
    };
    Ng2SimpleAutocomplete.prototype.initEventStream = function () {
        this.inputKeyUp$ = Observable_1.Observable.fromEvent(this.searchInput.nativeElement, 'keyup')
            .map(function (e) { return e; });
        this.inputKeyDown$ = Observable_1.Observable.fromEvent(this.searchInput.nativeElement, 'keydown')
            .map(function (e) { return e; });
        this.listenEventStream();
    };
    Ng2SimpleAutocomplete.prototype.listenEventStream = function () {
        var _this = this;
        // key up event
        this.inputKeyUp$
            .filter(function (e) {
            return !isArrowUpDown(e.keyCode) &&
                !isEnter(e.keyCode) &&
                !isESC(e.keyCode) &&
                !isTab(e.keyCode);
        })
            .debounceTime(400)
            .subscribe(function (e) {
            _this.onKeyUp(e);
        });
        // ESC
        this.inputKeyUp$
            .filter(function (e) { return isESC(e.keyCode); })
            .debounceTime(100)
            .subscribe(function (e) {
            _this.onEsc();
        });
        // enter
        this.inputKeyUp$
            .filter(function (e) { return isEnter(e.keyCode); })
            .subscribe(function (e) {
            _this.onEnterResult(e);
        });
        // cursor up & down
        this.inputKeyDown$
            .filter(function (e) { return isArrowUpDown(e.keyCode); })
            .subscribe(function (e) {
            e.preventDefault();
            _this.onFocusNextResult(e);
        });
        // delete
        this.inputKeyDown$
            .filter(function (e) { return isBackspace(e.keyCode) || isDelete(e.keyCode); })
            .subscribe(function (e) {
            _this.onDeleteSearchText();
        });
    };
    /**
     * on keyup == when input changed
     * @param e event
     */
    Ng2SimpleAutocomplete.prototype.onKeyUp = function (e) {
        this.isResultSelected = false;
        this.isFocusIn = true;
        this.isNoResults = false; // 입력중 검색결과는 알 수 없음
        this.search = e.target.value; // 2 way binding된 검색 키워드 업데이트
        // if static result, filter result by input text
        if (!this.isStatic) {
            this.searchResults = []; // reset search results
        }
        else {
            this.filterStaticResult(this.search);
        }
        if (!isEmptyString(this.search)) {
            this.onChangeInput.emit(e.target.value); // 검색 키워드 변경시 상위 컴포넌트에서 콜백 실행
        }
    };
    Ng2SimpleAutocomplete.prototype.filterStaticResult = function (search) {
        if (isEmptyString(search)) {
            this.filteredResults = this.searchResults.slice();
            return;
        }
        this.filteredResults = this.searchResults.filter(function (v) { return v.text.indexOf(search) > -1; });
        if (R.not(this.filteredResults.length)) {
            this.isNoResults = true;
        }
    };
    /**
     * 키보드 상하 입력
     */
    Ng2SimpleAutocomplete.prototype.onFocusNextResult = function (e) {
        this.isFocusIn = true;
        var results = this.searchResultsOnVisble;
        var resultLength = results.length;
        var focusIdx = results.findIndex(function (result) { return result.isFocus; });
        var nextIdx = isArrowUp(e.keyCode) ? focusIdx - 1 : focusIdx + 1;
        nextIdx = nextIdx % resultLength;
        nextIdx = nextIdx < 0 ? resultLength - 1 : nextIdx;
        if (nextIdx > -1) {
            this.setFocusedResult(nextIdx);
            this.scrollToFocusedItem(nextIdx);
        }
    };
    /**
     * 포커스된 아이템으로 스크롤한다.
     *
     * @param {any} index 결과 아이템 인덱스
     *
     * @memberOf AutocompleteComponent
     */
    Ng2SimpleAutocomplete.prototype.scrollToFocusedItem = function (index) {
        var listEl = this.isResultVisible ?
            this.searchResultsEl.nativeElement : this.searchHistoryEl.nativeElement;
        var items = Array.prototype.slice.call(listEl.childNodes);
        items = items.filter(function (node) {
            if (node.nodeType === 1) {
                return node.className.includes('autocomplete-item');
            }
            else {
                return false;
            }
        });
        var listHeight = listEl.offsetHeight;
        var itemHeight = items[index].offsetHeight;
        var visibleTop = listEl.scrollTop; // 표시영역 top
        var visibleBottom = listEl.scrollTop + listHeight - itemHeight; // 표시영역 bottom
        var targetPosition = items[index].offsetTop; // 이동할 위치
        // 아이템 위치가 표시 영역 위일 경우
        if (targetPosition < visibleTop) {
            listEl.scrollTop = targetPosition;
        }
        // 아이템 위치가 표시 영역 아래일 경우
        if (targetPosition > visibleBottom) {
            listEl.scrollTop = targetPosition - listHeight + itemHeight;
        }
    };
    /**
     * 검색 결과에 마우스오버
     * @param {[number]} index [searchResults 배열의 인덱스]
     */
    Ng2SimpleAutocomplete.prototype.onMouseOverResultItem = function (index) {
        this.setFocusedResult(index);
    };
    /**
     * 하이라이트된 입력을 수정한다.
     * @param {[number]} focusIdx [searchResults 배열에서 하이라이트할 인덱스]
     */
    Ng2SimpleAutocomplete.prototype.setFocusedResult = function (focusIdx) {
        var results = this.searchResultsOnVisble;
        results = results.map(function (result, idx) {
            if (idx === focusIdx) {
                return Object.assign(result, { isFocus: true });
            }
            else {
                return Object.assign(result, { isFocus: false });
            }
        });
    };
    /**
     * 검색 결과를 마우스로 직접 선택
     */
    Ng2SimpleAutocomplete.prototype.onClickResult = function (index, e) {
        var results = this.searchResultsOnVisble;
        this.emitResult(results[index]);
        this.isFocusIn = false;
    };
    /**
     * 자동완성 결과 엔터키 선택
     */
    Ng2SimpleAutocomplete.prototype.onEnterResult = function (e) {
        // 로딩중에는 입력되지 않도록
        if (this.isLoading) {
            return;
        }
        var results = this.searchResultsOnVisble;
        var focusedIdx = results.findIndex(function (result) { return result.isFocus; });
        var focused = results[focusedIdx];
        var unselected = (!this.autoFocusOnFirst || !this.search) ?
            { text: this.search, value: null } : null;
        // 자동포커스 옵션이 false인 경우에만 선택되지 않은 값을 전달한다.
        var selected = focused || unselected;
        if (!R.isNil(selected)) {
            this.isFocusIn = false;
            this.emitResult(selected);
        }
    };
    Ng2SimpleAutocomplete.prototype.onEsc = function () {
        this.isFocusIn = false;
        if (this.resetOnDelete) {
            this.onResetSearchText();
        }
    };
    /**
     * onSelect 콜백 호출
     * @param selected
     */
    Ng2SimpleAutocomplete.prototype.emitResult = function (selected) {
        this.isResultSelected = true;
        this.search = selected.text; // 입력 텍스트 변경
        this.searchChange.emit(selected.text); // 2-way binding
        this.onSelect.emit(selected);
        var isValidText = R.compose(R.not, R.both(isEmptyString, R.isNil))(selected.text || selected.markup);
        var isValidHistoryId = R.identity(this.historyId);
        if (isValidText && isValidHistoryId) {
            this.saveHistory(selected);
        }
    };
    /**
     * 키보드 화살표 위 입력일때 텍스트 인풋에서 커서가 맨 앞으로 이동하는 기본 동작 방지
     * @param {[type]} e [description]
     */
    Ng2SimpleAutocomplete.prototype.preventCursorPosition = function (e) {
        if (isArrowUpDown(e.keyCode)) {
            e.preventDefault();
        }
    };
    Ng2SimpleAutocomplete.prototype.onFocusout = function (e) {
        var _this = this;
        // click 보다 focusout 이벤트가 먼저 발생하기 때문에 목록을 클릭할 수 있게 딜레이를 준다.
        setTimeout(function () {
            // 선택되지 않은 상태에서 focusout이 발생한다면 초기화한다.
            if (!_this.isResultSelected && _this.resetOnFocusOut) {
                _this.onResetSearchText();
            }
            // 강제로 유지하지 않을 경우에만 포커스를 아웃시킨다
            if (!_this.maintainFocus) {
                _this.isFocusIn = false;
            }
            else {
                // 강제 유지할 경우 다시 input 태그에 포커스를 준다.
                _this.searchInput.nativeElement.focus();
                _this.maintainFocus = false;
            }
        }, 300);
    };
    Ng2SimpleAutocomplete.prototype.onFocusin = function () {
        this.isFocusIn = true;
    };
    /**
     * 검색 입력 텍스트 초기화(우측 x버튼 클릭)
     */
    Ng2SimpleAutocomplete.prototype.onResetSearchText = function () {
        this.search = '';
        this.isFocusIn = false; // 검색 결과 및 히스토리 닫기
        this.isNoResults = false;
        if (this.onReset) {
            this.onReset.emit();
        }
    };
    Ng2SimpleAutocomplete.prototype.onDeleteSearchText = function () {
        if (this.resetOnDelete) {
            this.onResetSearchText();
        }
    };
    /**
     * 검색 기록을 local storage에 저장
     */
    Ng2SimpleAutocomplete.prototype.saveHistory = function (selected) {
        this.searchHistory = R.pipe(R.map(function (v) { return Object.assign(v, { isFocus: false }); }), R.uniqWith(R.equals), R.take(this.HISTORY_MAX_LENGTH))(R.flatten([selected, this.searchHistory]));
        this.saveHistoryToLocalStorage(this.searchHistory);
    };
    Ng2SimpleAutocomplete.prototype.onClickResetHistory = function () {
        this.searchHistory = [];
        this.saveHistoryToLocalStorage(this.searchHistory);
    };
    Ng2SimpleAutocomplete.prototype.onDeleteHistoryItem = function (index) {
        this.maintainFocus = true; // 클릭시 focusout되기 때문에 포커스 유지를 위한 플래그 설정
        this.searchHistory = this.searchHistory.filter(function (v, i) { return i !== index; });
        this.saveHistoryToLocalStorage(this.searchHistory);
    };
    Ng2SimpleAutocomplete.prototype.saveHistoryToLocalStorage = function (history) {
        window.localStorage.setItem("ng2_simple_autocomplete_history_" + this.historyId, JSON.stringify(history));
    };
    Ng2SimpleAutocomplete.prototype.sanitize = function (markup) {
        return this.sanitizer.bypassSecurityTrustHtml(markup);
    };
    return Ng2SimpleAutocomplete;
}());
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [Object])
], Ng2SimpleAutocomplete.prototype, "search", null);
tslib_1.__decorate([
    core_1.Output(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "searchChange", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Array)
], Ng2SimpleAutocomplete.prototype, "searchResults", void 0);
tslib_1.__decorate([
    core_1.Output(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "onChangeInput", void 0);
tslib_1.__decorate([
    core_1.Output(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "onSelect", void 0);
tslib_1.__decorate([
    core_1.Output(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "onReset", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "isStatic", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "placeholder", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Boolean)
], Ng2SimpleAutocomplete.prototype, "isLoading", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", String)
], Ng2SimpleAutocomplete.prototype, "historyId", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "historyHeading", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "autoFocusOnFirst", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "resetOnDelete", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "resetOnFocusOut", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "noResultText", void 0);
tslib_1.__decorate([
    core_1.Input(),
    tslib_1.__metadata("design:type", Object)
], Ng2SimpleAutocomplete.prototype, "style", void 0);
tslib_1.__decorate([
    core_1.ViewChild('searchInput'),
    tslib_1.__metadata("design:type", core_1.ElementRef)
], Ng2SimpleAutocomplete.prototype, "searchInput", void 0);
tslib_1.__decorate([
    core_1.ViewChild('searchResultsEl'),
    tslib_1.__metadata("design:type", core_1.ElementRef)
], Ng2SimpleAutocomplete.prototype, "searchResultsEl", void 0);
tslib_1.__decorate([
    core_1.ViewChild('searchHistoryEl'),
    tslib_1.__metadata("design:type", core_1.ElementRef)
], Ng2SimpleAutocomplete.prototype, "searchHistoryEl", void 0);
Ng2SimpleAutocomplete = tslib_1.__decorate([
    core_1.Component({
        selector: 'ng2-simple-autocomplete',
        template: "\n    <div\n      class=\"autocomplete\"\n      [ngStyle]=\"style\"\n    >\n      <input\n        #searchInput\n        [(ngModel)]=\"_search\"\n        class=\"autocomplete-input\"\n        [ngClass]=\"isResultSelected && 'is-selected'\"\n        type=\"text\"\n        autocomplete=\"off\"\n        (keydown)=\"preventCursorPosition($event)\"\n        (focus)=\"onFocusin()\"\n        (focusout)=\"onFocusout($event)\"\n        [placeholder]=\"placeholder\"\n      />\n      <div\n        class=\"autocomplete-iconWrapper\"\n        [ngClass]=\"{ 'is-visible': isResetButtonVisible}\"\n        [ngStyle]=\"{ 'font-size': style['font-size']}\"\n        (click)=\"onResetSearchText()\"\n      >\n        <span class=\"autocomplete-icon deleteIcon\">\u2715</span>\n      </div>\n\n      <!--\n      <div\n        [ngClass]=\"{\n          'autocomplete-iconWrapper': true, 'is-visible': isLoading\n        }\"\n        (click)=\"onResetSearchText()\"\n      >\n        <i class=\"autocomplete-icon icon--refresh\">\u21BB</i>\n      </div>\n      -->\n\n      <div\n        [ngClass]=\"{ 'is-visible': isNoResultsVisible }\" class=\"autocomplete-result\"\n      >\n        {{ noResultText }}\n      </div>\n\n      <ul\n        #searchResultsEl\n        [ngClass]=\"{ 'is-visible': isResultVisible }\"\n        class=\"autocomplete-result\"\n      >\n        <li\n          class=\"autocomplete-item\"\n          *ngFor=\"let result of searchResultsOnVisble;let i = index\"\n          [ngClass]=\"{ 'is-focus': result.isFocus === true }\"\n          (click)=\"onClickResult(i)\"\n          (mouseover)=\"onMouseOverResultItem(i)\"\n          [innerHtml]=\"sanitize(result.markup || result.text)\"\n        ></li>\n      </ul>\n\n      <ul\n        #searchHistoryEl\n        class=\"autocomplete-result\"\n        [ngClass]=\"{ 'is-visible': isSearchHistoryVisible }\"\n      >\n        <li *ngIf=\"!!historyHeading\" class=\"autocomplete-resultTitle\">\n          <span [innerHtml]=\"sanitize(historyHeading)\"></span>\n          <!--\n          <span\n            (click)=\"onClickResetHistory()\"\n            class=\"autocomplete-historyTrash\"\n          ></span>\n          -->\n        </li>\n        <li\n          *ngFor=\"let result of searchHistory;let i = index\"\n          class=\"autocomplete-item\"\n          [ngClass]=\"{ 'is-focus': result.isFocus === true }\"\n        >\n          <div\n            (click)=\"onClickResult(i, $event)\"\n            (mouseover)=\"onMouseOverResultItem(i)\"\n            [innerHtml]=\"sanitize(result.markup || result.text)\"\n          >\n          </div>\n          <span class=\"autocomplete-iconWrapper is-visible\" (click)=\"onDeleteHistoryItem(i)\">\n            <span class=\"autocomplete-icon deleteIcon\">\u2715</span>\n          </span>\n        </li>\n\n        <!--\n        <li\n          *ngIf=\"!searchHistory.length\"\n          class=\"autocomplete-item\"\n        >no search history</li>\n        -->\n      </ul>\n    </div>\n  ",
        styles: ["\n    .autocomplete {\n      position: relative;\n      display: inline-block;\n      box-sizing: border-box;\n      padding: 0 0.75em;\n      width: 100%;\n      height: 35px;\n      line-height: 35px;\n      color: inherit;\n      font-size: inherit;\n      border-width: 1px;\n      border-style: solid;\n      border-radius: 2px;\n      border-color: #ddd;\n    }\n\n    .autocomplete-input {\n      box-sizing: border-box;\n      position: absolute;\n      top: 0;\n      left: 0;\n      display: block;\n      width: calc(100% - 2px);\n      height: calc(100% - 2px);\n      line-height: inherit;\n      padding: inherit;\n      border: 0;\n      background: none;\n      font-size: inherit;\n      font-weight: inherit;\n      color: inherit;\n      outline-width: 0;\n    }\n\n    .autocomplete-input.is-selected {\n      display: block;\n    }\n\n    .autocomplete-result {\n      box-sizing: border-box;\n      display: none;\n      position: absolute;\n      z-index: 100;\n      top: 100%;\n      left: -1px;\n      width: calc(100% + 2px);\n      padding: 0.5em 0.75em;\n      margin: 0;\n      max-height: 20em;\n      overflow: auto;\n      border-style: solid;\n      border-width: 1px;\n      border-radius: inherit;\n      border-color: inherit;\n      background-color: #fff;\n      list-style: none;\n      box-shadow: 0 2px 0px rgba(0, 0, 0, 0.1);\n      font-size: inherit;\n    }\n\n    .autocomplete-result.is-visible {\n      display: block;\n    }\n\n    .autocomplete-result > li {\n      line-height: 1.4 !important;\n    }\n\n    .autocomplete-item {\n      position: relative;\n      padding: 0.5em;\n      padding-right: 1.5em;\n      max-height: 200px;\n    }\n\n    .autocomplete-item.is-focus {\n      background-color: #eee;\n    }\n\n    .autocomplete-item:hover {\n      cursor: pointer;\n    }\n\n    .autocomplete-iconWrapper {\n      display: none;\n      position: absolute;\n      z-index: 10;\n      top: 0%;\n      right: 0;\n      width: 1.5em;\n      height: 100%;\n      padding: 0 0.3em;\n      text-align: center;\n      background: white;\n      border-radius: inherit;\n    }\n\n    .autocomplete-iconWrapper.is-visible {\n      display: block;\n    }\n\n    .autocomplete-icon {\n      position: absolute;\n      top: 50%;\n      left: 50;\n      transform: translate(-50%, -47%);\n      opacity: 0.3;\n    }\n\n    .autocomplete-icon.deleteIcon:hover {\n      opacity: 1;\n      cursor: pointer;\n    }\n\n    .autocomplete-iconWrapper:hover {\n      cursor: pointer;\n    }\n\n    .autocomplete-isLoading {\n      z-index: 20;\n    }\n\n    .autocomplete-closeBtn {\n      transition: all 0.2s ease-in-out;\n    }\n\n    .autocomplete-closeBtn:hover {\n      cursor: pointer;\n      transform: scale(1.5);\n    }\n\n    .autocomplete-resultTitle {\n      padding: 5px 8px;\n      font-size: 0.85em;\n      opacity: 0.8;\n      border-bottom: 1px solid rgba(230, 230, 230, 0.7);\n    }\n\n    .autocomplete-historyTrash {\n      float: right;\n      transition: all 0.2s ease-in-out;\n    }\n\n    .autocomplete-historyTrash:hover {\n      cursor: pointer;\n      transform: scale(1.5);\n    }\n\n    .autocomplete-deleteHistoryItemBtn {\n      z-index: 10;\n      position: absolute;\n      top: 50%;\n      right: 0;\n      transform: translateY(-50%);\n      width: 1.5em;\n      display: block;\n      color: #3b4752;\n      opacity: 0.3;\n      transition: all 0.2s ease-in-out;\n      font-size: 1em;\n      text-align: center;\n    }\n\n    .autocomplete-deleteHistoryItemBtn:hover {\n      opacity: 1;\n      cursor: pointer;\n    }\n\n    .autocomplete-deleteHistoryItemBtn:hover > i {\n      transform: scale(1.5);\n    }\n  "],
    }),
    tslib_1.__metadata("design:paramtypes", [platform_browser_1.DomSanitizer])
], Ng2SimpleAutocomplete);
exports.Ng2SimpleAutocomplete = Ng2SimpleAutocomplete;
