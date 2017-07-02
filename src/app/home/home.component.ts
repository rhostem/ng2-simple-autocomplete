import {
  Component,
  OnInit
} from '@angular/core';
import { AutoCompleteItem, AutocompleteStyle } from '../../ng2-simple-autocomplete';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const remoteData = [
  { _id: '1', name: 'lorem', },
  { _id: '2', name: 'ipsum', },
  { _id: '3', name: 'pixel', },
];

@Component({
  selector: 'home',  // <home></home>
  styleUrls: [ './home.component.css' ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  staticResults = [
    {
      text: 'ng2',
      value: '[ng2]',
    },
    {
      text: 'simple',
      value: '[simple]',
    },
    {
      text: 'autocomplete',
      value: '[autocomplete]',
    },
    {
      text: 'bold text by html tag',
      markup: '<b>bold text</b> by &lt;b&gt; tag',
      value: '[bold text by html tag]',
    },
  ];

  asyncResults = [];

  inputStyle: AutocompleteStyle = {
    'width': '300px',
    'color': 'blue',
    'font-size': '24px',
    'border-radius': '10px',
    'border-color': 'purple',
    'height': '50px',
    'line-height': '50px',
  };
  searchStatic = '';
  searchStaticHistory = '';
  searchAsync = '';
  selectedStatic: AutoCompleteItem;
  selectedStaticHistory: AutoCompleteItem;
  selectedAsync: AutoCompleteItem;

  constructor(
    public sanitizer: DomSanitizer,
  ) {
  }

  // public ngOnInit() {
  // }

  onSelectStatic(v: AutoCompleteItem) {
    this.selectedStatic = v;
  }

  onSelectStaticWithHistory(v: AutoCompleteItem) {
    this.selectedStaticHistory = v;
  }

  onSelectAsync(v: AutoCompleteItem) {
    this.selectedAsync = v;
  }

  onChangeSearchAsync(search) {
    this.fetchRemoteData().then((result: any[]) => {
      this.asyncResults = result
        .filter(v => v.name.indexOf(search) > -1)
        .map((v) => {
          return { text: v.name, value: v._id };
        });
    });
  }

  fetchRemoteData() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(remoteData);
      }, 200);
    });
  }


}
