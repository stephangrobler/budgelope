import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as moment from 'moment';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { take, mergeMap, map, tap } from 'rxjs/operators';
import { Budget } from '../shared/budget';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';

@Injectable()
export class BudgetService {
  activeBudget$: Observable<Budget>;

  constructor(
    private db: AngularFirestore,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private afAuth: AngularFireAuth
  ) {}

  getActiveBudget$(): Observable<Budget> {
    const returnable = this.afAuth.authState.pipe(
      mergeMap(currentUser => {
        // get the activebudget from the user object
        return this.db
          .doc<any>('users/' + currentUser.uid)
          .valueChanges()
          .pipe(
            mergeMap(user => {
              return this.db.doc<Budget>('budgets/' + user.activeBudget).valueChanges();
            })
          );
      })
    );
    return returnable;
  }

  createBudget(budget: Budget) {
    const dbRef = firebase.database().ref('budgets/' + budget.userId);
    const newBudget = dbRef.push();

    newBudget.set({
      name: budget.name,
      start: budget.start,
      active: budget.active,
      id: newBudget.key
    });
  }

  updateBudget(budget: Budget) {
    this.db.doc('budgets/' + budget.id).update(budget);
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
    const budgetStore = this.db.collection('budgets'),
      userStore = this.db.collection('users'),
      newBudget: Budget = new Budget();

    budgetStore
      .doc<Budget>(currentBudgetId)
      .valueChanges()
      .pipe(take(1))
      .subscribe(cBudget => {
        const categoryService = this.categoryService,
          accountService = this.accountService;

        // create new budget
        cBudget.allocations = {};
        cBudget.allocations[moment().format('YYYYMM')] = {
          income: 0,
          expense: 0
        };
        cBudget.balance = 0;
        delete cBudget.id;

        budgetStore.add(cBudget).then(function(docRef) {
          // rename old budget if not default
          const newName = cBudget.name + ' - FRESH START ' + moment().format('YYYY-MM-DD hh:mm:ss');
          if (currentBudgetId !== 'default') {
            budgetStore.doc(currentBudgetId).update({ name: newName });
            accountService.copyAccounts(currentBudgetId, docRef.id);
          }

          // set user active budget
          userStore
            .doc<any>(userId)
            .valueChanges()
            .subscribe(user => {
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
