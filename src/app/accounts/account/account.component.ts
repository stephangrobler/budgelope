import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as firebase from 'firebase';

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
  accountTitle: string;
  accountCurrent: number;
  account: Account;
  accountId: any;
  activeBudget: Budget;

  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private budgetService: BudgetService
  ) { }

  ngOnInit() {
    this.thisUser = this.userService.loggedInUser;
    this.route.params.forEach((params: Params) => {
      this.accountId = params["id"];
    });
    if (this.accountId != "add"){
      this.getAccount(this.accountId);
    }
    this.activeBudget = this.budgetService.getActiveBudget();
  }

  getAccount(id: string){
    let dbRef = firebase.database().ref('accounts').child(id);
    dbRef.once('value').then((snapshot) => {
      this.account = new Account();
      this.account.id = snapshot.val().id;
      this.account.title = snapshot.val().title;
      this.account.current = snapshot.val().current;

      this.accountTitle = this.account.title;
      this.accountCurrent = this.account.current;
    });
  }

  saveAccount(){
    if (this.accountId != "add"){
      this.editAccount();
    } else {
      this.createAccount();
    }
  }

  editAccount() {
    this.account.title = this.accountTitle;
    this.account.current = this.accountCurrent;
    this.accountService.updateAccount(this.account);
  }

  createAccount() {
    this.account = new Account();
    this.account.title = this.accountTitle;
    this.account.current = this.accountCurrent;
    this.account.budgetId = this.activeBudget.id;
    this.accountService.createAccount(this.account);
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }

}
