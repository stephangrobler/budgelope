import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Budget } from '../shared/budget';


@Injectable()
export class BudgetService {

  activeBudget: Budget;

  constructor() { }

  getActiveBudget() {
    if (null == this.activeBudget) {
      let currentUser = firebase.auth().currentUser;
      // get the activebudget from the user object
      let dbRef = firebase.database().ref('users/' + currentUser.uid + '/activeBudget');
      let tmpObj: any = {};

      dbRef.once('value').then((snapshot) => {
        let tmp: string[] = snapshot.val();
        let bRef = firebase.database().ref('budgets/' + tmp);

        bRef.once('value', (bSnap) => {
          tmpObj = bSnap.val();
          this.activeBudget = new Budget(
            tmpObj.name,
            new Date(),
            tmpObj.active,
            null,
            tmpObj.id
          );
        });
      });
    }
    return this.activeBudget;
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

}
