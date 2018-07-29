import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as moment from 'moment';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/mergeMap';

import { Budget } from '../shared/budget';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service'


@Injectable()
export class BudgetService {

  activeBudget$: Observable<Budget>;

  constructor(
    private db: AngularFirestore,
    private categoryService: CategoryService,
    private accountService: AccountService
  ) {

  }


  getActiveBudget$(): Observable<Budget> {
    let currentUser = firebase.auth().currentUser;
    // get the activebudget from the user object
    return this.db.doc<any>('users/' + currentUser.uid).valueChanges()
      .flatMap(user => this.db.doc<Budget>('budgets/' + user.activeBudget).valueChanges());
  }

  createBudget(budget: Budget) {
    let dbRef = firebase.database().ref('budgets/' + budget.userId);
    let newBudget = dbRef.push();

    newBudget.set({
      name: budget.name,
      start: budget.start,
      active: budget.active,
      id: newBudget.key
    })
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
    let budgetStore = this.db.collection('budgets'),
      userStore = this.db.collection('users'),
      cBudget: Budget,
      newBudget: Budget = new Budget();

    budgetStore.doc<Budget>(currentBudgetId).valueChanges().take(1).subscribe(t => {
      cBudget = t;
      let categoryService = this.categoryService,
        accountService = this.accountService;

      // create new budget
      cBudget.allocations = {};
      cBudget.allocations[moment().format("YYYYMM")] = {
        "income": 0,
        "expense": 0
      }
      cBudget.balance = 0;
      delete (cBudget.id);

      budgetStore.add(cBudget).then(function(docRef) {
        // rename old budget if not default
        let newName: string = t.name + ' - FRESH START ' + moment().format('YYYY-MM-DD hh:mm:ss');
        if (currentBudgetId != 'default') {

          budgetStore.doc(currentBudgetId).update({ 'name': newName });
          accountService.copyAccounts(currentBudgetId, docRef.id);
        }

        let userObj = {
          activeBudget: docRef.id,
          availableBudgets: {}
        };
        userObj.availableBudgets[docRef.id] = {name: newName};

        // set user active budget
        userStore.doc(userId).update(userObj);

        // copy categories
        categoryService.copyCategories(currentBudgetId, docRef.id);

        // copy payees

      });
    });



  }

}
