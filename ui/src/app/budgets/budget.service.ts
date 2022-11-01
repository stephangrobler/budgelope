import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Allocations, Budget } from '../shared/budget';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { map, tap } from 'rxjs/operators';
import dayjs from 'dayjs';
import { Category } from 'app/shared/category';

@Injectable()
export class BudgetService extends EntityCollectionServiceBase<Budget> {
    activeBudget$: Observable<Budget>;

    constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
        super('Budget', serviceElementsFactory);
    }

    freshStart() {}

    updateMonthCategory(transaction): Observable<Budget> {
        return this.getByKey(transaction.budget_id).pipe(
            map((budget) => {
                const shortMonth = dayjs().format('YYYYMM');
                const allocations = budget.allocations.slice();
                const allocIndex = allocations.findIndex((month) => month.month === shortMonth);
                const alloc = { ...allocations[allocIndex] } as Allocations;
                if (alloc) {                  
                    const categories = alloc.categories.slice();
                    let categoryIndex = categories.findIndex((cat) => cat._id === transaction.category_id);

                    const actual = categories[categoryIndex].actual + transaction.amount;
                    const balance = categories[categoryIndex].balance + transaction.amount;
                    const category = {
                        ...categories[categoryIndex],
                        balance,
                        actual,
                    } as Category;
                    categories.splice(categoryIndex, 1, category);
                    alloc.categories = categories;
                    allocations.splice(allocIndex, 1, alloc);
                }
                return { ...budget, allocations } as Budget;
            }),
            tap((budget) => this.update(budget))
        );
    }
}
