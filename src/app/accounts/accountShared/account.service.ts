import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Account } from '../../shared/account';

@Injectable()
export class AccountService {
  constructor() {

  }

  createAccount(account: Account){
    let dbRef = firebase.database().ref('accounts/' + account.budgetId);
    let newAccount = dbRef.push();
    newAccount.set({
      title: account.title,
      current: account.current,
      id: newAccount.key
    });
  }

  updateAccount(update: Account){
    let dbRef = firebase.database().ref('accounts').child(update.id)
      .update({
        title: update.title,
        current: update.current
      });
    alert('account updated');
  }

  removeAccount(delAccount: Account){
    let dbRef = firebase.database().ref('accounts').child(delAccount.id).remove();
    alert('account deleted');
  }
}
