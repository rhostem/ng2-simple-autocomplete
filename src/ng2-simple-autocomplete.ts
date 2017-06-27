import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ng2-simple-autocomplete',
  template: `
    <div>autocomplete</div>
  `,
  styles: [`
    .autocomplete {

    }
  `],
})
export class Ng2SimpleAutocomplete implements OnInit {
  // constructor() { }

  ngOnInit() {
    console.log('SimpleAutocomplete component loaded.');
  }
}
