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
  budgets: Budget[];

  constructor(private userService: UserService) {  }

  ngOnInit() {
    this.theUserId = this.userService.authUser.uid;
    this.getBudgets();

  }

  getBudgets(){
    let dbRef = firebase.database().ref('budgets/' + this.theUserId);

    dbRef.once('value').then((snapshot) => {
      let tmp: string[] = snapshot.val();
      this.budgets = Object.keys(tmp).map(key => tmp[key]);
    });
  }
}
