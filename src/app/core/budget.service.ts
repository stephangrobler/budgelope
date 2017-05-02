import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Budget } from '../shared/budget';


@Injectable()
export class BudgetService {

  activeBudget: Budget;

  constructor() {  }

  getActiveBudget() {
    if (null == this.activeBudget){
      let currentUser = firebase.auth().currentUser;
      let dbRef = firebase.database().ref('budgets/' + currentUser.uid);
      dbRef.orderByChild('active').equalTo(true).once('value').then((snapshot) => {
        let tmp: string[] = snapshot.val(),
            tmpObj = tmp[Object.keys(tmp)[0]];
            this.activeBudget = new Budget(
              tmpObj.name,
              new Date(),
              tmpObj.active
            );
        console.log(this.activeBudget);
  
      });
    }
    return this.activeBudget;

  }

  createBudget(budget: Budget){
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
