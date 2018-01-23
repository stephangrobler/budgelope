import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatTableDataSource } from '@angular/material';
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
  transactions: MatTableDataSource<Transaction>;
  displayedColumns: ['timestamp', 'account', 'payee','amount','category'];

  constructor(
    private transService: TransactionService,
    private budgetService: BudgetService,
    private userService: UserService,
    private router: Router,
    private db: AngularFireDatabase,
    private af: AngularFireAuth
  ) {
    af.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = db.object<any>('users/' + user.uid).valueChanges().subscribe(profile => {
        this.loadTransactions(profile.activeBudget);
      });
    });
  }

  ngOnInit() {

  }

  loadTransactions(budgetId: string) {
    let ref = 'transactions/' + budgetId;
    this.db.list<Transaction>(ref).snapshotChanges(['child_added']).subscribe(snapshots => {
      let list: any = [];
      snapshots.forEach(trans => {
        list.push(trans);
      });

      this.transactions = new MatTableDataSource(list);
      console.log(this.transactions);

    });
  }


}
