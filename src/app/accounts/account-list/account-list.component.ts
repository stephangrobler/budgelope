import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

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
  accounts: Account[];
  activeBudget: Budget;

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private router: Router
  ) {  }

  ngOnInit() {
    this.activeBudget = this.budgetService.getActiveBudget();
    console.log(this.activeBudget);
    this.getAccounts();

  }

  getAccounts(){
    let dbRef = firebase.database().ref('accounts/' + this.activeBudget.id );
    dbRef.once('value').then((snapshot) => {
      let tmp: string[] = snapshot.val();
      this.accounts = Object.keys(tmp).map(key => tmp[key]);
    });
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
