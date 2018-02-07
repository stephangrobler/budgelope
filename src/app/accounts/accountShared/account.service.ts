import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Account } from '../../shared/account';

@Injectable()
export class AccountService {
  constructor() {

  }

  createAccount(account: Account){
    // let dbRef = firebase.database().ref('accounts/' + account);
    // let newAccount = dbRef.push();
    // newAccount.set({
    //   name: account.name,
    //   balance: account.balance,
    //   id: newAccount.key
    // });
  }

  updateAccount(update: Account){
    let dbRef = firebase.database().ref('accounts').child(update.id)
      .update({
        name: update.name,
        balance: update.balance
      });
    alert('account updated');
  }

  removeAccount(delAccount: Account){
    let dbRef = firebase.database().ref('accounts').child(delAccount.id).remove();
    alert('account deleted');
  }
}
