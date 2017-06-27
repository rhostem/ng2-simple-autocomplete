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
