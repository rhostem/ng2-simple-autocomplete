import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ng2-simple-autocomplete',
  templateUrl: './ng2-simple-autocomplete.html',
  styleUrls: ['./ng2-simple-autocomplete.css']
  // styles: [`
  //   .autocomplete {

  //   }
  // `],
})
export class Ng2SimpleAutocomplete implements OnInit {
  // constructor() { }
  ngOnInit() {
    console.log('SimpleAutocomplete component loaded.');
  }
}
