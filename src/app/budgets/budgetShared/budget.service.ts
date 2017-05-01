import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Budget } from '../../shared/budget';


@Injectable()
export class BudgetService {
  constructor() {  }

  createBudget(budget: Budget){
    let dbRef = firebase.database().ref('budgets');
    let newBudget = dbRef.push();
    console.log(newBudget);
    console.log(budget);
    newBudget.set({
      name: budget.name,
      start: budget.start,
      userId: budget.userId,
      id: newBudget.key
    })
  }

}
