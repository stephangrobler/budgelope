import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CategoriesComponent } from './categories.component';
import { CategoryComponent } from './category/category.component';
import { CategoriesRoutingModule } from './categories-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, CategoriesRoutingModule, SharedModule],
  declarations: [CategoriesComponent, CategoryComponent],
  providers: []
})
export class CategoriesModule {}
