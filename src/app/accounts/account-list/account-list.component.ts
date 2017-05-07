import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';

import { UserService } from '../../shared/user.service';
import { Account } from '../../shared/account';
import { AccountService } from '../accountShared/account.service';
import { BudgetService } from '../../core/budget.service';
import { Budget } from '../../shared/budget';

@Component({
  templateUrl: 'account-list.component.html',
})
export class AccountListComponent implements OnInit {
  theUser: string;
  accounts: FirebaseObjectObservable<any>;
  activeBudget: Budget;

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private router: Router,
    private db:AngularFireDatabase
  ) {  }

  ngOnInit() {
    this.activeBudget = this.budgetService.getActiveBudget();
    let accRef = 'accounts/' + this.activeBudget.id;
    this.accounts = this.db.list(accRef);
  }

  editAccount(single: Account){
    this.router.navigate(['/account/'+single.id]);
  }

  deleteAccount(single: Account){
    let verify = confirm(`Are you sure you want to delete this account?`);
    if (true == verify){
      this.accountService.removeAccount(single);
    } else {
      alert(`Nothing deleted!`);
    }
  }

}
