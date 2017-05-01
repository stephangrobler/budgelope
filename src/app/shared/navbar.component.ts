import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

import { UserService } from './user.service';
import { Budget } from './budget';


@Component({
  selector: 'navi-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavComponent implements OnInit {
  theUser: string;
  theBudget: Budget;
  budgets : Budget[];

  constructor( private userService: UserService, private router: Router){}

  ngOnInit(){
    this.userService.verifyUser();
    this.theUser = this.userService.loggedInUser;
    firebase.auth().onAuthStateChanged(() => {
      console.log('auth changes');
      this.getActiveBudget();
    });
    // this.getActiveBudget();
  }

  getActiveBudget(){
    let currentUser = firebase.auth().currentUser;
    console.log('currentUser', currentUser);
    let dbRef = firebase.database().ref('budgets/' + currentUser.uid);
    dbRef.once('value').then((snapshot) => {
      let tmp: string[] = snapshot.val();
      console.log('budgets', snapshot.val());

      this.budgets = Object.keys(tmp).map(key => tmp[key]);
    });
  }


}
