/* tslint:disable:max-line-length */
import { Component, OnInit } from '@angular/core';
import { AutoCompleteItem } from '../../../ng2-simple-autocomplete';
import { HttpUtilService } from '../../service/http-util.service';
import { markdown } from 'markdown';

@Component({
  selector: 'async-search',
  templateUrl: './async-search.component.html',
  styleUrls: ['./async-search.component.css']
})
export class AsyncSearchComponent implements OnInit {
  search: string;
  results: AutoCompleteItem[] = [];
  isLoading: boolean;
  selected = <AutoCompleteItem> {};

  desc = markdown.toHTML('This exmample utilizes [Github open AP](https://developer.github.com/v3/)I. When search input changes, fetch github repositories by name and reassign result to `serachResult` from `onChangeInput`.');

  constructor(
    public httpUtil: HttpUtilService,
  ) {}

  ngOnInit() {
  }

  onSelect(item: AutoCompleteItem) {
   this.selected = item;
  }

  onChangeSearch(search: string) {
    this.isLoading = true;
    this.httpUtil.getAPI(`https://api.github.com/search/repositories?q=${search}&sort=stars&order=desc&limit=10`)
      .toPromise()
      .then((res) => {
        const repos = res.json().items;
        this.isLoading = false;
        this.results = repos.map((repo) => {
          return {
            text: repo.name,
            markup: `${repo.owner.login} / <b>${repo.name}</b>`,
            value: repo.name
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.isLoading = false;
      });
  }
}
