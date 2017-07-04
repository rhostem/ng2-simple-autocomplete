import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import {
  RouterModule,
  PreloadAllModules
} from '@angular/router';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { HomeComponent } from './home';
import { NoContentComponent } from './no-content';
import '../styles/styles.scss';

import { Ng2SimpleAutocomplete } from '../ng2-simple-autocomplete';
import { AsyncSearchComponent } from './examples/async-search/async-search.component';
import { StaticListComponent } from './examples/static-list/static-list.component';
import { StaticHistoryComponent } from './examples/static-history/static-history.component';
import { StyleCustomizingComponent } from './examples/style-customizing/style-customizing.component';
import { KeepHtmlPipe } from './pipe/keep-html.pipe';

// Application wide providers
const APP_PROVIDERS = [
];

type StoreType = {
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    HomeComponent,
    NoContentComponent,
    Ng2SimpleAutocomplete,
    AsyncSearchComponent,
    StaticListComponent,
    StaticHistoryComponent,
    StyleCustomizingComponent,
    KeepHtmlPipe,
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules })
  ],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers: [
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {
  constructor(
    public appRef: ApplicationRef,
  ) {}
}
