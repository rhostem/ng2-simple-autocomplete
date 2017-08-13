import { Component, OnInit } from '@angular/core';
const ReadME = require('./readme.md');

@Component({
  selector: 'readme',
  templateUrl: './readme.component.html',
  styleUrls: ['./readme.component.css']
})
export class ReadmeComponent implements OnInit {
  readme = ReadME;

  constructor() {
  }

  ngOnInit() {

  }

}
