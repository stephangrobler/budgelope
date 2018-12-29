import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Transaction, ITransactionID } from '../shared/transaction';
import { TransactionService } from './transaction.service';
import { BudgetService } from '../budgets/budget.service';
import { UserService } from '../shared/user.service';
import { BehaviorSubject } from 'rxjs';
import { IAccount } from 'app/shared/account';

@Component({
  templateUrl: 'transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  title = 'Transactions';
  userId: string;
  budgetId: string;
  accountId: string;
  account: IAccount;
  categoryId: string;
  displayedColumns = ['date', 'account', 'payee', 'category', 'out', 'in', 'cleared'];
  dataSource: TransactionDataSource;
  newTransaction: Transaction;
  showCleared = false;
  showTransaction = false;

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
    // const ref = this.afs.collection('/budgets/LFfPXVPxxmL6Tthl4bcA/transactions').where('categories.7LMKnFJv5Jdf6NEzAuL2', '>', '');
    // ref.get().then(transactions => console.log(transactions)).catch(reason => console.log('error', reason));

    this.af.authState.subscribe((user) => {
      if (!user) {
        return;
      }

      const profile = this.db.doc<any>('users/' + user.uid).valueChanges().subscribe(profileRead => {
        this.userId = user.uid;
        this.budgetId = profileRead.activeBudget;
        this.accountId = null;
        this.dataSource = new TransactionDataSource(this.transService, profileRead.activeBudget);
        this.route.paramMap.subscribe(params => {
          console.log(params);
          if (params.get('accountId')) {
            this.accountId = params.get('accountId');
            this.db.doc<IAccount>('budgets/' + this.budgetId + '/accounts/' + this.accountId).valueChanges().subscribe(account => {
              this.account = account;
            })
          }
          if (params.get('categoryId')) {
            this.categoryId = params.get('categoryId');
          }
          if (params.get('id')) {
            this.showTransaction = true;
          }
          this.dataSource.loadTransactions(this.accountId, this.showCleared, this.categoryId);
        });
      });
    });
    this.newTransaction = new Transaction({
      date: new Date()
    });
  }

  onZeroStartingBalanceClick() {
    this.transService.createStartingBalance(this.accountId, this.budgetId, 0);
  }

  onFilterClearedToggle() {
    this.dataSource.loadTransactions(this.accountId, this.showCleared);
  }

  onFixTransactions() {
    this.transService.transformCategoriesToMap(this.budgetId);
  }

  onMatchTransactions() {
    this.transService.matchTransactions(this.budgetId);
  }

  toggleCleared(transaction: ITransactionID) {
    transaction.cleared = !transaction.cleared;
    this.transService.updateClearedStatus(this.budgetId, transaction);
  }

  selectedRow(row) {
    this.selectedTransaction = row;
    this.router.navigate(['/app/transactions', row.id]);
  }
}

export class TransactionDataSource extends DataSource<any> {

  private transactionsSubject = new BehaviorSubject<any>([]);

  constructor(private transService: TransactionService, private budgetId: string) {
    super();
  }

  connect() {
    return this.transactionsSubject.asObservable();
  }

  disconnect() {
    this.transactionsSubject.complete();
  }

  loadTransactions(accountId: string, showCleared: boolean, categoryId?: string) {
    if (categoryId) {
      showCleared = true;
    }
    this.transService.getTransactions(this.budgetId, accountId, showCleared)
      .subscribe(transactions => {
        if (categoryId) {
          transactions = transactions.filter(transaction => transaction.categories[categoryId] !== undefined);
        }
        this.transactionsSubject.next(transactions)
      });
  }

}
