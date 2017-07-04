import { Component, OnInit } from '@angular/core';
import { AutoCompleteItem } from '../../../ng2-simple-autocomplete';

@Component({
  selector: 'static-list',
  templateUrl: './static-list.component.html',
  styleUrls: ['./static-list.component.css']
})
export class StaticListComponent implements OnInit {
  search: string;
  isLoading: boolean;
  selected = <AutoCompleteItem> {};
  results: AutoCompleteItem[] = [
    {
      text: 'angular.js',
      markup: 'angular / <b>angular.js</b>',
      value: 460078
    },
    {
      text: 'ionic',
      markup: 'ionic-team / <b>ionic</b>',
      value: 12256376
    },
    {
      text: 'angular',
      markup: 'angular / <b>angular</b>',
      value: 24195339
    },
    {
      text: 'angular-styleguide',
      markup: 'johnpapa / <b>angular-styleguide</b>',
      value: 22362099
    },
    {
      text: 'bootstrap',
      markup: 'angular-ui / <b>bootstrap</b>',
      value: 6094683
    },
    {
      text: 'angular-seed',
      markup: 'angular / <b>angular-seed</b>',
      value: 1195004
    },
    {
      text: 'AngularJS-Learning',
      markup: 'jmcunningham / <b>AngularJS-Learning</b>',
      value: 10536180
    },
    {
      text: 'angular-cli',
      markup: 'angular / <b>angular-cli</b>',
      value: 36891867
    },
    {
      text: 'NativeScript',
      markup: 'NativeScript / <b>NativeScript</b>',
      value: 31492490
    },
    {
      text: 'mean',
      markup: 'linnovate / <b>mean</b>',
      value: 10219106
    }
  ];

  componentMarkup = `
  <ng2-simple-autocomplete
    [(search)]="search"
    [searchResults]="results"
    (onSelect)="onSelect($event)"
    (onChangeInput)="onChangeSearch($event)"
    [isStatic]="true"
  ></ng2-simple-autocomplete>
  `;

  constructor(
  ) {}

  ngOnInit() {
  }

  onSelect(item: AutoCompleteItem) {
   this.selected = item;
  }

  onChangeSearch(search: string) {
  }
}
