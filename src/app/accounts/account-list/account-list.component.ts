import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../../core/user.service';
import { Account } from '../../shared/account';
import { AccountService } from '../../core/account.service';
import { BudgetService } from '../../core/budget.service';
import { Budget } from '../../shared/budget';

@Component({
  templateUrl: 'account-list.component.html',
})
export class AccountListComponent implements OnInit {
  theUser: string;
  accounts: any;
  activeBudget: string;

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private budgetService: BudgetService,
    private router: Router,
    private db:AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    afAuth.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
        this.loadAccounts(profile.activeBudget);
      });
    });


  }

  ngOnInit() {

  }

  loadAccounts(budgetId: string){
    let accRef = 'budgets/'+budgetId+'/accounts';
    this.accounts = this.accountService.getAccounts(budgetId);
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
