import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdToolbarModule, MdButtonModule, MdIconModule} from '@angular/material';

import { NavComponent } from './navbar.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    BrowserAnimationsModule,
    MdToolbarModule,
    MdButtonModule,
    MdIconModule
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
