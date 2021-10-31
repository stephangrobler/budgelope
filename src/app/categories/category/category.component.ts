import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Category } from '../../shared/category';
import { CategoryService } from '../category.service';
import { AuthService } from 'app/shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: 'category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  title = 'Category';
  categories: Observable<Category[]>;

  categoryId: string;
  budget_id: string;
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    parent: [''],
    type: ['expense', Validators.required],
    _id: ['']
  });
  category: Category;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.auth.currentUser.subscribe((user) => {
      if (!user) return;
      this.budget_id = user.active_budget_id;
      this.categories = this.categoryService.filteredEntities$;
      // get the category id from the route
      this.route.paramMap.subscribe((params) => {
        this.categoryId = params.get('id');
        if (this.categoryId !== 'add') {
          this.categoryService.getByKey(this.categoryId).subscribe(category => {
            this.category = category;
            this.form.patchValue(category);
          });
        }
      });
    });
  }

  onSubmit() {
    const category = this.form.value;
    category.budget_id = this.budget_id;
    category.balance = 0;
    category.actual = 0;
    category.planned = 0;

    if (category.parent && category.parent.name !== '') {
      category.parent_id = category.parent._id;
    } else {
      category.parent_id = '';
    }
    category.type = category.type;

    if (this.categoryId === 'add') {
      this.categoryService.add(category).subscribe(() => this.router.navigate(['/app/budget']));
    } else {
      this.categoryService.update(category).subscribe(() => this.router.navigate(['/app/budget']));
    }
  }

  cancel() {
    this.router.navigate(['/app/budget']);
  }
}
