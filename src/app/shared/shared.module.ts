import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  MatToolbarModule,
  MatGridListModule,
  MatButtonModule,
  MatInputModule,
  MatNativeDateModule,
  MatListModule,
  MatCardModule,
  MatIconModule,
  MatSidenavModule,
  MatTableModule,
  MatCheckboxModule,
  MatRadioModule,
  MatDatepickerModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatSnackBarModule,
  MatMenuModule,
  MatSlideToggleModule
} from '@angular/material';

import { FlexLayoutModule } from '@angular/flex-layout';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { AuthService } from './auth.service';
import { AuthGuardService } from './auth-guard.service';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
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
    MatSlideToggleModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatMenuModule,
    AppRoutingModule
  ],
  exports: [
    FlexLayoutModule,
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
    MatSlideToggleModule,
    MatMenuModule
  ],
  declarations: [],
  providers: [AuthGuardService, AuthService]
})
export class SharedModule {}
