import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Budget } from '../../shared/budget';


@Injectable()
export class BudgetService {
  constructor() {  }

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
