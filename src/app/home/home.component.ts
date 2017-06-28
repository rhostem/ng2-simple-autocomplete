import {
  Component,
  OnInit
} from '@angular/core';
import { AutoCompleteResult } from '../../ng2-simple-autocomplete';

@Component({
  selector: 'home',  // <home></home>
  styleUrls: [ './home.component.css' ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  results: AutoCompleteResult[] = [];
  inputStyle = {
    'width': '300px',
    'font-weight': 'normal',
    // 'font-size': '20px',
    'height': '40px',
    'line-height': '40px',
    'border': '2px solid #eee',
    'border-radius': '4px',
  };
  search = '';
  selected: AutoCompleteResult;

  // constructor(
  // ) {
  // }

  public ngOnInit() {
    this.selected = { text: '', value: '' };
    this.results = [
      {
        text: 'Ng2',
        value: 'value_Ng2',
      },
      {
        text: 'Simple',
        value: 'value_Simple',
      },
      {
        text: 'Autocomplete',
        value: 'value_Autocomplete',
      },
      {
        markup: '<b>bold text</b>by html tag',
        value: 'value_<b>bold text</b>by html tag',
      },
    ];
  }

  onSelect(v: AutoCompleteResult) {
    this.selected = v;
  }




}
