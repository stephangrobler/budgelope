import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Transaction } from '../shared/transaction';
import { TransactionService } from './transaction.service';
import { BudgetService } from '../budgets/budget.service';
import { UserService } from '../shared/user.service';
import { TransactionComponent } from './transaction/transaction.component';

@Component({
  templateUrl: 'transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  title = 'Transactions';
  userId: string;
  budgetId: string;
  accountId: string;
  displayedColumns = ['date', 'account', 'payee', 'category', 'out', 'in', 'cleared'];
  dataSource: TransactionDataSource;
  newTransaction: Transaction;

  selectedTransaction: Transaction;

  constructor(
    private transService: TransactionService,
    private budgetService: BudgetService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private af: AngularFireAuth
  ) {

  }

  ngOnInit() {
    this.af.authState.subscribe((user) => {
      if (!user) {
        return;
      }

      const profile = this.db.doc<any>('users/' + user.uid).valueChanges().subscribe(profileRead => {
        this.userId = user.uid;
        this.budgetId = profileRead.activeBudget;
        this.route.paramMap.subscribe(params => {
          if (params.get('accountId')) {
            this.accountId = params.get('accountId');
            this.dataSource = new TransactionDataSource(this.transService, profileRead.activeBudget, this.accountId);
          } else {
            this.dataSource = new TransactionDataSource(this.transService, profileRead.activeBudget);
          }
        })
      });
    });
    this.newTransaction = new Transaction({
      date: new Date()
    });
  }

  toggleCleared(transaction: Transaction) {
    transaction.cleared = !transaction.cleared;
    console.log(transaction);
  }

  selectedRow(row) {
    this.selectedTransaction = row;
    console.log(row);
    this.router.navigate(['/app/transactions', row.id]);
  }
}

export class TransactionDataSource extends DataSource<any> {

  constructor(private transService: TransactionService, private budgetId: string, private accountId?: string) {
    super();
  }

  connect() {
    return this.transService.getTransactions(this.budgetId, this.accountId);
  }

  disconnect() {

  }
}
