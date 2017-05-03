import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Category } from '../../shared/category';
import { CategoryService } from '../../core/category.service';
import { UserService } from '../../shared/user.service';

@Component({
  templateUrl: 'category.component.html',
})
export class CategoryComponent implements OnInit {
  name: string;
  parent: string = "";
  theUserId: string;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private userService: UserService
  ) {  }

  ngOnInit() {
    this.theUserId = this.userService.authUser.uid;
  }

  saveCategory(){
    let category = new Category();
    category.name = this.name;
    category.parent = this.parent;
    category.userId = this.theUserId;

    this.categoryService.createCategory(category);
  }

  cancel(){
    this.router.navigate(['/categories']);
  }

}
