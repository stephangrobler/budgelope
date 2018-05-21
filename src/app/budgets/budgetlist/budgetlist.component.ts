import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

import { Budget } from '../../shared/budget';
import { UserService } from '../../shared/user.service';


@Component({
  selector: 'budget-list',
  templateUrl: 'budgetlist.component.html',
})
export class BudgetListComponent implements OnInit {
  theUserId: string;
  budgets: any[];

  constructor(private userService: UserService) {  }

  ngOnInit() {
    this.theUserId = this.userService.authUser.uid;
    this.getBudgets();

  }

  getBudgets(){
    let dbRef = firebase.database().ref('users/'+this.theUserId+'/budgets');

    dbRef.once('value').then((snapshot) => {
      let tmp: string[] = snapshot.val();
      let bList: any[] = [];

      // loop through to get all the users budgets
      Object.keys(tmp).forEach((key) => {
        let bRef = firebase.database().ref('budgets/'+key);
        bRef.once('value', (bSnap) => {
          bList.push(bSnap.val());
        });
      });
      this.budgets = bList;
    });
  }
}
