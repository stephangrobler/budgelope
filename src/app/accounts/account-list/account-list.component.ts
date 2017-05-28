import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

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
  accounts: FirebaseListObservable<any>;
  activeBudget: string;

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private router: Router,
    private db:AngularFireDatabase,
    private afAuth: AngularFireAuth
  ) {
    afAuth.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = db.object('users/' + user.uid).subscribe(profile => {
        this.loadAccounts(profile.activeBudget);
      });
    });


  }

  ngOnInit() {

  }

  loadAccounts(budgetId: string){
    let accRef = 'accounts/' + budgetId;
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
