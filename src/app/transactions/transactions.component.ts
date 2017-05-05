import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

import { Transaction } from '../shared/transaction';
import { TransactionService } from '../core/transaction.service';
import { BudgetService } from '../core/budget.service';
import { UserService } from '../shared/user.service';

@Component({
  templateUrl: 'transactions.component.html',
})
export class TransactionsComponent implements OnInit {

  userId: string;
  budgetId: string;
  transactions: Transaction[];

  constructor(
    private transService: TransactionService,
    private budgetService: BudgetService,
    private userService: UserService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.userId = this.userService.authUser.uid;
    this.budgetId = this.budgetService.getActiveBudget().id;
    let ref = 'transactions/' + this.userId + '/' + this.budgetId;
    this.getTransactions();
  }

  getTransactions(){
    let dbRef = firebase.database().ref('transactions/' + this.userId + '/' + this.budgetId);
    let theList = [];
    dbRef.on('child_added', (snapshot, prevKey) => {
      let transVal = snapshot.val();
      let id = snapshot.key;

      let transaction = new Transaction();
      transaction.id = id;
      transaction.amount = transVal.amount;
      transaction.date = new Date(transVal.timestamp);
      transaction.category = transVal.category;
      transaction.account = transVal.account;

      theList.push(transaction);
    });

    this.transactions = theList;
  }
}
