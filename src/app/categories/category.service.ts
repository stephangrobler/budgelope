import { Injectable } from '@angular/core';
import { Category } from '../shared/category';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory
} from '@ngrx/data';

@Injectable()
export class CategoryService extends EntityCollectionServiceBase<Category> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Category', serviceElementsFactory);
  }

  async updateCategoryBudget(
    categoryId: string,
    shortDate: string,
    inAmount: number,
    outAmount: number
  ): Promise<any> {
    const category = await this.getByKey(categoryId).toPromise();
    if (!category['allocations']) {
      category['allocations'] = {};
    }
    const amount = inAmount - outAmount;
    category['balance'] += amount;

    if (!category['allocations'][shortDate]) {
      category['allocations'][shortDate] = {
        actual: 0,
        planned: 0
      };
    }
    category['allocations'][shortDate].actual += amount;
    return this.update(category).toPromise();
  }

  async copyCategories(fromBudgetId: string, toBudgetId: string) {
    const fromStore = 'budgets/' + fromBudgetId + '/categories',
      toStore = 'budgets/' + toBudgetId + '/categories';
    const categories = await this.getAll().toPromise();
    // categories.forEach(item => {
    //   const doc = this.db.collection(toStore).doc(item.id);
    //   delete item.id;
    //   doc.set(item);
    // }, this);
  }
}
