import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Category } from '../../shared/category';
import { UserService } from '../../shared/user.service';

export interface CategoryId extends Category {
  id: string;
}

@Component({
  templateUrl: 'category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  title = 'Category';
  name: string;
  parent: CategoryId;
  categories: Observable<CategoryId[]>;
  childCounts: any;
  theUserId: string;
  activeBudget: string;
  categoryId: string;
  category = {} as Category;
  profile: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private auth: AngularFireAuth,
    private db: AngularFirestore
  ) {}

  ngOnInit() {
    // get the category id from the route
    this.route.paramMap.subscribe(params => {
      this.categoryId = params.get('id');
    });

    this.userService.getProfile().subscribe(profile => {
      this.activeBudget = profile.activeBudget;
      this.loadParentCategories(profile.activeBudget);
      if (this.categoryId !== 'add') {
        this.db
          .doc<any>('categories/' + profile.activeBudget + '/' + this.categoryId)
          .valueChanges()
          .subscribe(cat => {
            this.category = cat;
          });
      }
    });
  }

  loadParentCategories(budgetId: string) {
    const ref = 'budgets/' + budgetId + '/categories';
    const parentCategories = this.db.collection<Category>(ref, ls => ls.where('parent', '==', ''));

    // get all the categories so that we can have counts to do the correct
    // saving and counts :P
    this.categories = parentCategories.snapshotChanges().pipe(
      map(catSnap => {
        return catSnap.map(cs => {
          const data = cs.payload.doc.data() as Category;
          const id = cs.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  onSubmit() {
    let ref = 'budgets/' + this.activeBudget + '/categories';

    if (this.parent && this.parent.name !== '') {
      this.category.parent = this.parent.name;
      this.category.parentId = this.parent.id;
    } else {
      this.category.parent = '';
      this.category.parentId = '';
    }
    this.category.type = this.category.type;

    if (this.categoryId === 'add') {
      this.db
        .collection<Category>(ref)
        .add({
          name: this.category.name,
          parent: this.category.parent,
          parentId: this.category.parentId,
          type: this.category.type,
          sortingOrder: '000',
          balance: 0
        })
        .then(() => console.log('Add Successfull.'));
      // this.categoryService.createCategory(this.activeBudget, this.category);
    } else {
      ref += '/' + this.categoryId;
      this.db
        .doc(ref)
        .update({
          name: this.category.name,
          parent: this.category.parent,
          parentId: this.category.parentId,
          type: this.category.type
        })
        .then(() => console.log('Update Successfull.'));

      // this.categoryService.updateCategory(this.activeBudget, this.category);
    }
  }

  cancel() {
    this.router.navigate(['/app/budget']);
  }
}
