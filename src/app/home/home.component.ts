import {
  Component,
  OnInit
} from '@angular/core';
import { AutoCompleteResult } from '../../ng2-simple-autocomplete';

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
      text: 'Ng2',
      value: '[value]',
    },
    {
      text: 'Simple',
      value: '[value]',
    },
    {
      text: 'Autocomplete',
      value: '[value]',
    },
    {
      markup: '<b>bold text</b> by html tag',
      value: '[value]',
    },
  ];

  asyncResults = [];

  inputStyle = {
    'width': '300px',
    'font-weight': 'normal',
    // 'font-size': '20px',
    'height': '40px',
    'line-height': '40px',
    'border': '2px solid #eee',
    'border-radius': '4px',
  };
  searchStatic = '';
  searchStaticHistory = '';
  searchAsync = '';
  selectedStatic: AutoCompleteResult;
  selectedStaticHistory: AutoCompleteResult;
  selectedAsync: AutoCompleteResult;

  // constructor(
  // ) {
  // }

  public ngOnInit() {
  }

  onSelectStatic(v: AutoCompleteResult) {
    this.selectedStatic = v;
  }

  onSelectStaticWithHistory(v: AutoCompleteResult) {
    this.selectedStaticHistory = v;
  }

  onSelectAsync(v: AutoCompleteResult) {
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
