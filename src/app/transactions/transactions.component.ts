import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { TransactionID } from '../shared/transaction';
import { TransactionService, IFilter } from './transaction.service';
import { BudgetService } from '../budgets/budget.service';
import { UserService } from '../shared/user.service';
import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import { IAccount } from 'app/shared/account';
import { ImportComponent } from './import/import.component';
import { AuthService } from 'app/shared/auth.service';
import { takeUntil, take, tap } from 'rxjs/operators';
import { AccountComponent } from 'app/accounts/account/account.component';
import { TransactionComponent } from './transaction/transaction.component';
import { AccountService } from 'app/accounts/account.service';
import { QueryParams, MergeStrategy } from '@ngrx/data';

@Component({
  templateUrl: 'transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  unsubscribe: Subject<any> = new Subject<any>();

  title = 'Transactions';
  userId: string;
  budgetId: string;
  accountId: string;
  account: IAccount;
  categoryId: string;
  displayedColumns = [
    'date',
    'account',
    'payee',
    'category',
    'out',
    'in',
    'cleared',
    'matched'
  ];
  dataSource: TransactionDataSource;
  newTransaction: TransactionID;
  showCleared = false;
  showTransaction = false;

  selectedTransaction: TransactionID;
  loading$: Observable<boolean>;

  constructor(
    private transService: TransactionService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public accountService: AccountService
  ) {
    this.loading$ = this.transService.loading$;
  }

  ngOnInit() {
    this.userService
      .getProfile()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(profileRead => {
        this.budgetId = profileRead.activeBudget;
        this.accountId = null;
        this.dataSource = new TransactionDataSource(
          this.transService,
          profileRead.activeBudget
        );
        this.route.paramMap
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(params => {
            if (params.get('accountId')) {
              this.accountId = params.get('accountId');
              this.accountService
                .getByKey(params.get('accountId'))
                .subscribe(account => {
                  this.account = account;
                });
            }
            if (params.get('categoryId')) {
              this.categoryId = params.get('categoryId');
            }
            if (params.get('id')) {
              this.showTransaction = true;
            }
            this.dataSource.loadTransactions(
              this.accountId,
              '' + this.showCleared,
              this.categoryId
            );
          });
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  openTransactionModal() {
    const dialogConfig = {
      width: '80vw',
      data: { accountId: this.accountId, budgetId: this.budgetId }
    } as MatDialogConfig;
    const dialogRef = this.dialog.open(TransactionComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log('Transaction Result', result);
    });
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(ImportComponent, {
      data: {
        accountId: this.accountId,
        budgetId: this.budgetId,
        accountName: this.account.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog Result', result);
    });
  }

  openAccountDialog() {
    const dialogRef = this.dialog.open(AccountComponent, {
      data: {
        accountId: this.accountId,
        budgetId: this.budgetId,
        accountName: this.account.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Account Dialog Result', result);
    });
  }

  onZeroStartingBalanceClick() {
    this.transService.createStartingBalance(this.accountId, this.budgetId, 0);
  }

  onFilterClearedToggle() {
    this.dataSource.loadTransactions(this.accountId, '' + this.showCleared);
  }

  toggleCleared(transaction: TransactionID) {
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
  private transactions: Observable<TransactionID[]>;
  private loading: Observable<boolean>;

  constructor(
    private transService: TransactionService,
    private budgetId: string
  ) {
    super();
    this.transactions = this.transService.filteredEntities$;
    this.loading = this.transService.loading$;
  }

  connect() {
    return this.transactions;
  }

  disconnect() {}

  loadTransactions(
    accountId: string,
    showCleared: string,
    categoryId?: string
  ) {
    const filter: QueryParams = {
      accountId: accountId,
      categoryId: categoryId,
      cleared: showCleared,
      budgetId: this.budgetId
    };
    if (categoryId) {
      filter.cleared = 'true';
    }
    this.transService.setFilter(filter);
    this.transService.getWithQuery(filter).pipe(
      tap(response => {
        console.log('Data Get:', response, filter);
      })
    );
  }
}
