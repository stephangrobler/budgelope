import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { CategoriesComponent } from './categories.component';
import { CategoriesRoutingModule } from './categories-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CategoriesRoutingModule,
    SharedModule
  ],
  declarations: [
    CategoriesComponent
  ],
  providers: [

  ]
})
export class CategoriesModule { }
