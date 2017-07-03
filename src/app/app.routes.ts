/* tslint:disable:max-line-length */
import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { NoContentComponent } from './no-content';
import { AsyncSearchComponent } from './examples/async-search/async-search.component';
import { StaticListComponent } from './examples/static-list/static-list.component';
import { StaticHistoryComponent } from './examples/static-history/static-history.component';
import { StyleCustomizingComponent } from './examples/style-customizing/style-customizing.component';

export const ROUTES: Routes = [
  { path: '',      component: HomeComponent },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'async-search', component: AsyncSearchComponent },
      { path: 'static-list', component: StaticListComponent },
      { path: 'static-history', component: StaticHistoryComponent },
      { path: 'style-cusomizing', component: StyleCustomizingComponent },
    ]
  },
  // { path: 'home/',  component: HomeComponent },
  // { path: 'home/',  component: HomeComponent },
  { path: '**',    component: NoContentComponent },
];
