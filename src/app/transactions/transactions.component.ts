import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
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
  displayedColumns = ['account', 'payee','category', 'amount'];
  dataSource = new TransactionDataSource(this.transService);


  constructor(
    private transService: TransactionService,
    private budgetService: BudgetService,
    private userService: UserService,
    private router: Router,
    private db: AngularFirestore,
    private af: AngularFireAuth
  ) {
    af.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
      });
    });
  }

  ngOnInit() {

  }



}

export class TransactionDataSource extends DataSource<any>{
  constructor (private transService : TransactionService) {
    super();
  }

  connect() {
    this.transService.getTransactions().subscribe(te => {
      console.log(te);
    });
    return this.transService.getTransactions();
  }

  disconnect() {

  }
}
