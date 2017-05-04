import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

import { Category } from '../shared/category';
import { CategoryService} from '../core/category.service';
import { UserService } from '../shared/user.service';

@Component({
  templateUrl: 'categories.component.html',
})

export class CategoriesComponent implements OnInit {
  userId: string;
  categories: Category[];

  constructor(
    private userService: UserService
  ) {  }

  ngOnInit() {
    this.userId = this.userService.authUser.uid;
    this.getCategories();
  }

  getCategories(){
    let dbRef = firebase.database().ref('categories/'+this.userId);
    dbRef.once('value').then((snapshot) => {
      let tmp: string[] = snapshot.val();
      this.categories = Object.keys(tmp).map(key => tmp[key]);
    });
  }
}
