/**
 * Angular 2 decorators and services
 */
import {
  Component,
  OnInit,
} from '@angular/core';
import { AppState } from './app.service';
import { MenuService } from './service/menu-service.service';

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  styleUrls: [
    './app.component.scss'
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  menuiconUrl = require('../assets/images/menu_white.png');

  constructor(
    public menu: MenuService,
  ) {}

  public ngOnInit() {
  }
}

/**
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
