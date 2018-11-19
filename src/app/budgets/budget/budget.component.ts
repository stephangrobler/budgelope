import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Budget } from '../../shared/budget';
import { BudgetService } from '../budget.service';
import { UserService } from '../../shared/user.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'budget-form',
  templateUrl: 'budget.component.html',
})
export class BudgetComponent implements OnInit {
  budgetName: string;
  userId: string;
  

  constructor(
    private router: Router,
    private budgetService: BudgetService,
    private userService: UserService,
    private auth: AngularFireAuth,
    private db: AngularFirestore
  ) {  }

  ngOnInit() {
    this.auth.authState.subscribe(user => {
      if (!user) {
        return;
      }
      this.userId = user.uid;
      // get active budget TODO: move to service :P
      const subscription = this.db
        .doc<any>('users/' + user.uid)
        .valueChanges()
        .subscribe(profile => {
          console.log('Current Active Budget: ', profile.activeBudget);
        });
    });
  }

  saveBudget() {
    const budget = new Budget();
    budget.name = this.budgetName;

    this.budgetService.createBudget(budget, this.userId);
  }

  cancel() {
    this.router.navigate(['/budgets']);
  }
}
