export class Category {
  name: string;
  spent: number;
  budgetId: string;
  createdAt: Date;
  parentCategory: Category;
  childCategories: Array<Category>;
}
