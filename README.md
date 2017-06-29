# ng2-simple-autocomplete

ng2-simple-autocomplete is autocomplete component for Angular. It mainly focuses on asynchronous search result from remote data. But it also supports static dataset. This autocomplete component supports custom styling, selection history,


## Installation

```bash
npm install --save ng2-simple-autocomplete
```

```bash
yarn add ng2-simple-autocomplete
```

And add it to your Angular Module for use.

```typescript
import { Ng2SimpleAutocomplete } from 'ng2-simple-autocomplete';

@NgModule({
  declarations: [
    Ng2SimpleAutocomplete,
  ],
})
export class AppModule {
}
```

## Usage sample

### Dynamic dataset

```html
<ng2-simple-autocomplete
  [(search)]="keyword"
  [searchResults]="remoteData"
  (onSelect)="onSelectAutocomplete($event)"
  (onChange)="onChangeSearchKeyword($event)"
></ng2-simple-autocomplete>
```

```typescript
import { AutoCompleteItem } from 'ng2-simple-autocomplete';

class TestComponent {
  keyword: string;
  remoteData: AutoCompleteItem[] = [];

  onSelect(item: AutoCompleteItem) {
    // do something with selected item
  }

  onChange(search: string) {
    // fetch remote data from here and reassign it to searchResults
  }
}
```

Basically, a dataset binded to the autocomplete component does not change unless it is changed from parent component. So user has to change it manually when search input changes.

### Static dataset

```html
<ng2-simple-autocomplete
  [(search)]="keyword"
  [searchResults]="staticData"
  (onSelect)="onSelectAutocomplete($event)"
  [isStatic]="true"
></ng2-simple-autocomplete>
```

```typescript
import { AutoCompleteItem } from 'ng2-simple-autocomplete';

class TestComponent {
  keyword: string;
  staticData: AutoCompleteItem[] = [];

  onSelect(item: AutoCompleteItem) {
    // do something with selected item
  }
}
```

If `isStatic` property is set as `true`, then dataset is automatically filtered when input changes.


## Working example

[https://rhostem.github.io/ng2-simple-autocomplete](https://rhostem.github.io/ng2-simple-autocomplete)


## API

### interface

`interfce AutoCompleteItem`

Face of object in `searchResults` array. 

```typescript
export interface AutoCompleteItem {
  value: any;         
  text: string;       
  markup?: string;    
  isFocus?: boolean;  
}
```

`value` and `text` are mandatory. If `markup` property is specified, component uses it rather than text. So user can customize a result text with HTML.


### Input property

#### `search: string`

Text of input field. Use 'banana-in-box' notation for 2-way binding.

```html
<ng2-simple-autocomplete
  [(search)]="keyowrd"
></ng2-simple-autocomplete>
```

#### `searchResults: AutoCompleteItem[]`

List of autocomplete item. 


#### `onChangeInput: EventEmitter`

Invoked when input is changed.


#### `onSelect: EventEmitter`

Invoked when user selects items in search result of history. User can select item by mouse click or keyboard up/down and enter.


#### `onReset: EventEmitter`

Invoked when user click 'X' button at right side of input box.


#### `isStatic: boolean`

default: `false`

If want to bind static list for `searchResults` property, then set is as true. Then component will automatically filter the list when input changes.


### `placeholder: string` '';

default: `search keyword`

same as that of `input` element.


#### `noResultText: boolean`

default: `false`

Invoke `onReset` event when input element losts  focus.


#### `historyId: string`

When valid history id is given, then component stores selected item to local storage of user's browser. 

It is **'selection item'** history. Not 'search keyword' history. So it saves `AutocompleteResult` object to history. And `onSelect` event is invoked when user selects history item also.

History is visible when `search` is empty and there is at least 1 history item.

If same history ids are used over several component, it shares same history list.


#### `historyHeading: string`

default: `Recently selected`

Text ahead of history list. 

If you want to remove this heading, bind `null` value for `historyHeading` property.


#### `autoFocusOnFirst: boolean`

default: `true`

When result list is open, first item is automatically highlighted. So user can select it directly after input search keyword by pressing enter key.


#### `resetOnDelete: boolean`

default: `false`

Invoke `onReset` event when user deletes input keyword by pressing backspace key.


#### `resetOnFocusOut: boolean`

default: `false`

Invoke `onReset` event when input element losts focus.


#### `noResultText: string`

default: `There is no results`

This is visible when there is no items in `searchResults`.

