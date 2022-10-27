import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Category } from '../../shared/category';
import { CategoryService } from '../category.service';
import { AuthService } from 'app/shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryGroup } from 'app/shared/category_group';
import { CategoryGroupService } from '../category_groups.service';

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
    categoryGroup: [''],
    type: ['expense', Validators.required],
    is_group: ['false', Validators.required],
    _id: ['']
  });
  category: Category;
  categoryGroups: Observable<CategoryGroup[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private categoryGroupService: CategoryGroupService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.auth.currentUser.subscribe((user) => {
      if (!user) return;
      this.budget_id = user.active_budget_id;
      this.categories = this.categoryService.filteredEntities$;
      this.categoryGroups = this.categoryGroupService.getAll();
      this.categoryGroups.subscribe(groups => console.log(groups));
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
    const isGroup = this.form.get('is_group').value;
    if (isGroup){
      this.saveCategoryGroup();
    } else {
      this.saveCategory();
    }
  }

  saveCategoryGroup() {
    const categoryGroup: CategoryGroup = this.form.value;
    categoryGroup.budget_id = this.budget_id;
    categoryGroup.hidden = false;
    categoryGroup.deleted = false;

    if (this.categoryId === 'add') {
      delete(categoryGroup._id);
      this.categoryGroupService.add(categoryGroup).subscribe(() => this.router.navigate(['/app/budget']));
    } else {
      this.categoryGroupService.update(categoryGroup).subscribe(() => this.router.navigate(['/app/budget']));
    }
  }

  saveCategory() {
    const category: Category = this.form.value;
    category.budget_id = this.budget_id;
    category.balance = 0;
    category.actual = 0;
    category.planned = 0;
    category.category_group_id = category.categoryGroup._id;
   
    category.type = category.type;

    if (this.categoryId === 'add') {  
      delete(category._id);    
      this.categoryService.add(category).subscribe(() => this.router.navigate(['/app/budget']));
    } else {
      this.categoryService.update(category).subscribe(() => this.router.navigate(['/app/budget']));
    }
  }

  cancel() {
    this.router.navigate(['/app/budget']);
  }
}
