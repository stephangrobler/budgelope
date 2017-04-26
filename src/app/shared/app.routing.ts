import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { ErrorComponent } from '../error/error.component';
import { LoginComponent } from '../login/login.component';
import { SignUpComponent } from '../signup/signup.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {path: '', component: HomeComponent},
            {path: 'login', component: LoginComponent},
            {path: 'signup', component: SignUpComponent},
            {path: '**', component: ErrorComponent }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {}
