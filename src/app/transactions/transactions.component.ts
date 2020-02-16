import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { Transaction } from '../shared/transaction';
import { TransactionService } from './transaction.service';
import { UserService } from '../shared/user.service';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { IAccount, IAccountId } from 'app/shared/account';
import { ImportComponent } from './import/import.component';
import { takeUntil, take, tap } from 'rxjs/operators';
import { AccountComponent } from 'app/accounts/account/account.component';
import { TransactionComponent } from './transaction/transaction.component';
import { AccountService } from 'app/accounts/account.service';
import { QueryParams } from '@ngrx/data';
import { TransactionDataService } from 'app/store/entity/transaction-data-service';
import { CategoryId } from 'app/categories/category/category.component';

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
  account: IAccountId;
  categoryId: string;
  displayedColumns = ['date', 'payee', 'category', 'out', 'in', 'cleared'];
  dataSource: TransactionDataSource;
  newTransaction: Transaction;
  showCleared = false;
  showTransaction = false;

  selectedTransaction: Transaction;
  loading$: Observable<boolean>;

  constructor(
    private transService: TransactionService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public accountService: AccountService,
    public transData: TransactionDataService
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
        this.renameTransactions();
        this.dataSource = new TransactionDataSource(
          this.transService,
          profileRead.activeBudget
        );
        this.route.paramMap
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(params => {
            if (params.get('accountId')) {
              this.accountId = params.get('accountId');
              this.accountService.collection$.subscribe(collection => {
                if (collection.entities[this.accountId]) {
                  this.account = collection.entities[this.accountId];
                }
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

  renameTransactions() {
    this.transService.getAll().pipe(take(1)).subscribe(async transactions => {
      // this.transService.batchUpdateInterface(transactions, this.budgetId);
    })
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
        accountName: this.account
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
        accountName: this.account
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

  toggleCleared(transaction: Transaction) {
    transaction.cleared = !transaction.cleared;
    this.transService.updateClearedStatus(this.budgetId, transaction);
  }

  selectedRow(row) {
    this.selectedTransaction = row;
    this.router.navigate(['/app/transactions', row.id]);
  }

  displayCategories(categories: { [categoryId: string]: Partial<CategoryId>}) {
    const keys = Object.keys(categories);
    if (keys.length > 1) {
      return 'Split';
    } else if (!categories[keys[0]]) {
      return 'No Category Specified';
    } else {
      return categories[keys[0]].name;
    }
  }
}

export class TransactionDataSource extends DataSource<any> {
  private transactionsSubject = new BehaviorSubject<any>([]);
  private transactions: Observable<Transaction[]>;
  private loading: Observable<boolean>;
  private unsubscribe = new Subject<boolean>();

  constructor(
    private transService: TransactionService,
    private budgetId: string
  ) {
    super();
    this.transactions = this.transService.filteredEntities$.pipe(
      tap(this.calculateTotal)
    );
    this.loading = this.transService.loading$;
  }

  calculateTotal = (transactions: Transaction[]) => {
    if (transactions.length > 0) {
      const total = transactions.reduce((acc, curVal) => {
        acc += curVal.amount;
        return acc;
      }, 0);
      const totalCleared = transactions.reduce((acc, curVal) => {
        acc += curVal.cleared ? curVal.amount : 0;
        return acc;
      }, 0);
      console.log('Total: ', total);
      console.log('Total Cleared: ', totalCleared);
    }
  };

  connect() {
    return this.transactions;
  }

  disconnect() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

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
    this.transService.clearCache();
    this.transService.getWithQuery(filter).pipe(takeUntil(this.unsubscribe));
  }
}
