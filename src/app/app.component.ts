import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';


import { UserService } from './shared/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';

  constructor(private userService: UserService){}

  ngOnInit(){
    this.userService.verifyUser();
    
  }
}
