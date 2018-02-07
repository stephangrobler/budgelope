import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {MatCheckboxModule, MatIconModule, MatInputModule, MatRadioModule, MatDatepickerModule, MatSelectModule, MatCardModule, MatButtonModule} from '@angular/material';

import { SharedModule } from '../shared/shared.module';
import { CategoriesComponent } from './categories.component';
import { CategoryComponent } from './category/category.component';
import { CategoriesRoutingModule } from './categories-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CategoriesRoutingModule,
    SharedModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule
  ],
  declarations: [
    CategoriesComponent,
    CategoryComponent
  ],
  providers: [

  ]
})
export class CategoriesModule { }
