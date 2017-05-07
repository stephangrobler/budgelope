import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

import { UserService } from '../../shared/user.service';
import { AccountService } from '../accountShared/account.service';
import { Account } from '../../shared/account';
import { BudgetService } from '../../core/budget.service';
import { Budget } from '../../shared/budget';

@Component({
  templateUrl: 'account.component.html',
})
export class AccountComponent implements OnInit {
  thisUser: string;

  accName: string;
  accStartingBalance: number;

  account: Account;
  accountId: any;
  accountType: string;
  activeBudget: Budget;
  item: FirebaseObjectObservable<any>;

  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private budgetService: BudgetService,
    private db:AngularFireDatabase
  ) { }

  ngOnInit() {
    this.thisUser = this.userService.loggedInUser;
    this.route.params.forEach((params: Params) => {
      this.accountId = params["id"];
    });
    this.activeBudget = this.budgetService.getActiveBudget();
    if (this.accountId != "add"){
      this.item = this.db.object('accounts/'+this.activeBudget.id +'/'+this.accountId);
      this.item.subscribe(acc => { this.account = acc });
    }
    console.log('account', this.account);
  }


  saveAccount(){
    if (this.accountId != "add"){
      this.editAccount();
    } else {
      this.createAccount();
    }
  }

  editAccount() {
    if (!this.account.balance){
      this.item.update({
        name: this.account.name,
        startingBalance: this.account.startingBalance,
        balance: this.account.startingBalance
      });
    } else {
      this.item.update({
        name: this.account.name,
        startingBalance: this.account.startingBalance
      });
    }

  }

  createAccount() {
    this.account = new Account();
    this.account.name = this.accName;
    this.account.startingBalance = this.accStartingBalance;
    this.account.budgetId = this.activeBudget.id;
    this.accountService.createAccount(this.account);
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }

}
