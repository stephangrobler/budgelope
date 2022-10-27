import { Injectable } from '@angular/core';
import { Category } from '../shared/category';
import {
  EntityCache,
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class CategoryService extends EntityCollectionServiceBase<Category> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Category', serviceElementsFactory);
  }

  updateCategoryBudget(categoryId: string, amount: number) {
    return this.getByKey(categoryId).pipe(
      take(1),
      switchMap((category) => {
        const balance = category.balance + amount;
        const actual = category.actual + amount;
        return this.update({ ...category, balance, actual });
      })
    );
  }

  async copyCategories(fromBudgetId: string, toBudgetId: string) {
    try {
    } catch (err) {
      console.log(err);
    }
  }
}
