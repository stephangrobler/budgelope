import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CategoriesComponent } from './categories.component';
import { CategoryComponent } from './category/category.component';

const routes: Routes = [
  { path: 'categories', component: CategoriesComponent },
  { path: 'category/:id', component: CategoryComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class CategoriesRoutingModule { }
