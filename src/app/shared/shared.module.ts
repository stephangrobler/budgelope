import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatToolbarModule, MatGridListModule, MatButtonModule, MatInputModule, MatNativeDateModule,
  MatListModule, MatCardModule, MatIconModule, MatSidenavModule, MatTableModule, MatCheckboxModule,
  MatRadioModule, MatDatepickerModule, MatSelectModule, MatAutocompleteModule, MatSnackBarModule } from '@angular/material';

import { } from '@angular/material';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { AuthGuardService } from '../core/auth-guard.service';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatGridListModule,
    MatNativeDateModule,
    MatListModule,
    MatSidenavModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    AppRoutingModule
  ],
  exports: [
    MatTableModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatGridListModule,
    MatButtonModule,
    MatNativeDateModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSidenavModule,
  ],
  declarations: [
  ],
  providers: [
    AuthGuardService
  ]
})
export class SharedModule { }
