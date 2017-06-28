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
    'font-size': '24px',
    'height': '40px',
    'line-height': '40px',
    'border': '2px solid #eee',
    'border-radius': '4px',

  };

  // constructor(
  // ) {
  // }

  public ngOnInit() {

    this.results = [
      {
        markup: '<b>result 1</b>',
        value: 'result 1',
      },
      {
        text: 'result 2',
        value: 'result 2',
      },
      {
        text: 'result 3',
        value: 'result 3',
      },
      {
        text: 'result 4',
        value: 'result 4',
      },
    ];

  }
}
