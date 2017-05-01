import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { NavComponent } from './navbar.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule
  ],
  exports: [
    NavComponent
  ],
  declarations: [
    NavComponent
  ],
  providers: [

  ]
})
export class SharedModule { }
