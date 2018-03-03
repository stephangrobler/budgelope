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
import { UserService } from '../core/user.service';
import { TransactionComponent } from './transaction/transaction.component';

@Component({
  templateUrl: 'transactions.component.html'
})
export class TransactionsComponent implements OnInit {

  userId: string;
  budgetId: string;
  displayedColumns = ['date', 'account', 'payee', 'category', 'out', 'in'];
  dataSource: TransactionDataSource;
  newTransaction: Transaction;

  selectedTransaction: Transaction;


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
        this.userId = user.uid;
        this.budgetId = profile.activeBudget;
        this.dataSource = new TransactionDataSource(this.transService, profile.activeBudget);
      });
    });
    this.newTransaction = new Transaction({
      date: new Date()
    });
  }

  ngOnInit() {
  }

  selectedRow(row){
    this.selectedTransaction = row;
  }
}

export class TransactionDataSource extends DataSource<any>{

  constructor(private transService: TransactionService, private budgetId : string) {
    super();
  }

  connect() {
    return this.transService.getTransactions(this.budgetId);
  }

  disconnect() {

  }
}
