import { NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { NavComponent } from './navbar.component';

@NgModule({
  imports: [
    RouterModule
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
