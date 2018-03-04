import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule, MatButtonModule, MatIconModule} from '@angular/material';

import { NavComponent } from './navbar.component';
import { AuthGuardService } from '../core/auth-guard.service';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    NavComponent
  ],
  declarations: [
    NavComponent
  ],
  providers: [
    AuthGuardService

  ]
})
export class SharedModule { }
