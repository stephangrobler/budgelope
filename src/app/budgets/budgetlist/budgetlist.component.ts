import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

import { Budget } from '../../shared/budget';


@Component({
  selector: 'budget-list',
  templateUrl: 'budgetlist.component.html',
})
export class BudgetListComponent implements OnInit {
  budgets: Budget[];

  constructor() {  }

  ngOnInit() {
    this.getBudgets();
  }

  getBudgets(){
    let dbRef = firebase.database().ref('budgets');

    dbRef.once('value').then((snapshot) => {
      let tmp: string[] = snapshot.val();
      this.budgets = Object.keys(tmp).map(key => tmp[key]);
    });
  }
}
