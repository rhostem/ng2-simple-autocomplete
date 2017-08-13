/* tslint:disable:max-line-length */
import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { NoContentComponent } from './no-content';
import { AsyncSearchComponent } from './examples/async-search/async-search.component';
import { StaticListComponent } from './examples/static-list/static-list.component';
import { StaticHistoryComponent } from './examples/static-history/static-history.component';
import { StyleCustomizingComponent } from './examples/style-customizing/style-customizing.component';
import { ReadmeComponent } from './readme/readme.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'async-search', pathMatch: 'full' },
      { path: 'readme', component: ReadmeComponent },
      { path: 'async-search', component: AsyncSearchComponent },
      { path: 'static-list', component: StaticListComponent },
      { path: 'static-history', component: StaticHistoryComponent },
      { path: 'style-cusomizing', component: StyleCustomizingComponent },
    ]
  },
  { path: '**',    component: NoContentComponent },
];
