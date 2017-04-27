import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

import { UserService } from '../../shared/user.service';
import { Account } from '../../shared/account';
import { AccountService } from '../accountShared/account.service';

@Component({
  templateUrl: 'account-list.component.html',
})
export class AccountListComponent implements OnInit {
  theUser: string;
  accounts: Account[];

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private router: Router
  ) {  }

  ngOnInit() {
    this.theUser = this.userService.loggedInUser;
    this.getAccounts();
  }

  getAccounts(){
    let dbRef = firebase.database().ref('accounts');
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
