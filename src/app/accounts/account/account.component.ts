import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { UserService } from '../../shared/user.service';
import { AccountService } from '../account.service';
import { Account } from '../../shared/account';
import { BudgetService } from '../../budgets/budget.service';
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


  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private budgetService: BudgetService,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.thisUser = this.userService.authUser.uid;;
    this.route.params.forEach((params: Params) => {
      this.accountId = params["id"];
    });
    this.budgetService.getActiveBudget$().subscribe(budget => {
      this.activeBudget = budget
      if (this.accountId != "add") {
        let accRef = 'budgets/' + this.activeBudget.id + '/accounts/' + this.accountId;
        this.db.doc<Account>(accRef).valueChanges().subscribe(account => this.account = account);
      } else {
        this.account = new Account();
      }
    });
  }


  saveAccount() {
    if (this.accountId != "add") {
      this.editAccount();
    } else {
      this.createAccount();
    }
  }

  editAccount() {
    let accountRef = 'budgets/' + this.activeBudget.id + '/accounts/' + this.accountId;
    this.db.doc<Account>(accountRef).update(this.account);
  }

  createAccount() {
    this.accountService.createAccount(this.activeBudget, this.account);
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }

}
