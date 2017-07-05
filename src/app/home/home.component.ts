/* tslint:disable:max-line-length */
import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { AutoCompleteItem, AutocompleteStyle } from '../../ng2-simple-autocomplete';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpUtilService } from '../service/http-util.service';
import 'rxjs/add/operator/toPromise';
import { Router } from '@angular/router';
import { MenuService } from '../service/menu-service.service';

const remoteData = [
  { _id: '1', name: 'lorem', },
  { _id: '2', name: 'ipsum', },
  { _id: '3', name: 'pixel', },
];

@Component({
  selector: 'home',  // <home></home>
  styleUrls: [ './home.component.scss' ],
  templateUrl: './home.component.html',
  providers: [ HttpUtilService ],
})
export class HomeComponent implements OnInit, OnChanges {
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

  asyncResults: AutoCompleteItem[] = [];
  repositories: AutoCompleteItem[] = [];

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
  isLoadingRepo: boolean;
  isMenuVisible = false;

  constructor(
    public sanitizer: DomSanitizer,
    public httpUtil: HttpUtilService,
    public router: Router,
    public menu: MenuService,
  ) {
  }

  public ngOnInit() {
    this.listenRouteChange();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  listenRouteChange() {
    this.router.events.subscribe((e) => {
      this.menu.isVisibleOnMobile = false;
      window.scrollTo(0, 0);
    });
  }

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

  /**
   * on change github respoitory search keyword
   *
   * @param {string} search
   * @memberof HomeComponent
   */
  onChangeRepoSearch(search: string) {
    this.isLoadingRepo = true;
    this.httpUtil.getAPI(`https://api.github.com/search/repositories?q=${search}&sort=stars&order=desc&limit=10`)
      .toPromise()
      .then((res) => {
        const repos = res.json().items;
        this.isLoadingRepo = false;
        this.repositories = repos.map((repo) => {
          return {
            text: repo.name,
            markup: `${repo.owner.login} / <b>${repo.name}</b>`,
            value: repo.name
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.isLoadingRepo = false;
      });
  }


}
