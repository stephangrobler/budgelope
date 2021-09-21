import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { take, mergeMap, map, tap } from 'rxjs/operators';
import { Budget } from '../shared/budget';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';
import { FirebaseApp } from '@angular/fire';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';

@Injectable()
export class BudgetService extends EntityCollectionServiceBase<Budget> {
  activeBudget$: Observable<Budget>;

  constructor(
    private db: AngularFirestore,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private afAuth: AngularFireAuth,
    private fb: FirebaseApp,
    serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super('Budget', serviceElementsFactory);
  }

  getActiveBudget(): Observable<Budget> {
    const returnable = this.afAuth.authState.pipe(
      mergeMap((currentUser) => {
        // get the activebudget from the user object
        return this.db
          .doc<any>('users/' + currentUser.uid)
          .valueChanges()
          .pipe(
            mergeMap((user) => {
              if (user.activeBudget === '') {
                throw new Error('There is no active budget set.');
              }
              return this.db
                .doc<Budget>('budgets/' + user.activeBudget)
                .valueChanges();
            })
          );
      })
    );
    return returnable;
  }

  async createBudget(budget: Budget, userId: string) {
    budget.balance = 0;
    budget.userId = userId;
    budget.allocations = {};
    budget.start = new Date();

    const budgetDocument = await this.db
      .collection('budgets')
      .add(JSON.parse(JSON.stringify(budget)));

    await this.db
      .doc<any>('users/' + userId)
      .update({ activeBudget: budgetDocument.id });
    // copy categories
    await this.categoryService.copyCategories('default', budgetDocument.id);
    return budgetDocument;
  }

  /**
   * Update the balances of the budget in a db transaction
   *
   * @param budgetId The id of the budget to update
   * @param date The date of the transaction
   * @param amount The amount of the transaction
   */
  updateBudgetBalance(
    budgetId: string,
    date: Date,
    amount: number
  ): Promise<any> {
    const docRef = this.db.doc('budgets/' + budgetId).ref;

    return this.fb.firestore().runTransaction((transaction) => {
      return transaction.get(docRef).then(
        (budgetRaw) => {
          const shortDate = moment(date).format('YYYYMM');
          const budget = budgetRaw.data() as Budget;

          if (!budget.allocations[shortDate]) {
            budget.allocations[shortDate] = {
              expense: 0,
              income: 0,
            };
          }

          // ensure value is negative if it is an expense.
          if (amount > 0) {
            budget.balance += amount;
            budget.allocations[shortDate].income += amount;
          } else {
            budget.allocations[shortDate].expense += Math.abs(amount);
          }
          return transaction.update(docRef, budget);
        },
        (error) => {
          throw Error(error);
        }
      );
    });
  }

  /**
   * Creates a new budget with current accounts and categories of existing budget
   * to start a new with tracking etc
   * @param  currentBudgetId The id of the budget needed to copy
   * @param  userId          the user id which to update the active budget to
   * @return                 nothing
   */
  freshStart(currentBudgetId: string, userId: string) {
    // get current budget and store id
    const budgetStore = this.db.collection('budgets');
    const userStore = this.db.collection('users');

    budgetStore
      .doc<Budget>(currentBudgetId)
      .valueChanges()
      .pipe(take(1))
      .subscribe((cBudget) => {
        const categoryService = this.categoryService,
          accountService = this.accountService;

        // create new budget
        cBudget.allocations = {};
        cBudget.allocations[moment().format('YYYYMM')] = {
          income: 0,
          expense: 0,
        };
        cBudget.balance = 0;
        delete cBudget.id;

        budgetStore.add(cBudget).then(function (docRef) {
          // rename old budget if not default
          const newName =
            cBudget.name +
            ' - FRESH START ' +
            moment().format('YYYY-MM-DD hh:mm:ss');
          if (currentBudgetId !== 'default') {
            budgetStore.doc(currentBudgetId).update({ name: newName });
            accountService.copyAccounts(currentBudgetId, docRef.id);
          }

          // set user active budget
          userStore
            .doc<any>(userId)
            .valueChanges()
            .subscribe((user) => {
              user.activeBudget = docRef.id;
              if (!user.availableBudgets) {
                user.availableBudgets = {};
              }
              user.availableBudgets[docRef.id] = { name: newName };
              userStore.doc(userId).update(user);
            });

          // copy categories
          categoryService.copyCategories(currentBudgetId, docRef.id);
          // copy payees
        });
      });
  }
}
