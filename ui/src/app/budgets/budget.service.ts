import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Allocations, Budget } from '../shared/budget';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs';
import { Category } from 'app/shared/category';

@Injectable()
export class BudgetService extends EntityCollectionServiceBase<Budget> {
  activeBudget$: Observable<Budget>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Budget', serviceElementsFactory);
  }

  updateMonthCategory(transaction): Observable<Budget> {
    console.log(
      '🚀 ~ file: budget.service.ts ~ line 18 ~ BudgetService ~ updateMonthCategory ~ transaction',
      transaction
    );
    return this.getByKey(transaction.budget_id).pipe(
      map((budget) => {
        const shortMonth = dayjs().format('YYYYMM');
        const allocations = budget.allocations.slice();
        const allocIndex = allocations.findIndex(
          (month) => month.month === shortMonth
        );
        const alloc = { ...allocations[allocIndex] } as Allocations;
        if (alloc) {
          const categories = alloc.categories.slice();
          let categoryIndex = categories.findIndex(
            (cat) => cat._id === transaction.category_id
          );

          const actual = categories[categoryIndex].actual + transaction.amount;
          const balance =
            categories[categoryIndex].balance + transaction.amount;
          const category = {
            ...categories[categoryIndex],
            balance,
            actual,
          } as Category;
          alloc.categories = categories.splice(categoryIndex, 1, category);
        }
        budget.allocations = allocations;
        return budget;
      })
    );
  }
}
