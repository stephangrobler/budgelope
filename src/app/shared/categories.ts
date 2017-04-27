export class Category {
  name: string;
  spent: number;
  budget: number;
  createdAt: Date;
  parentCategory: Category;
  childCategories: Array<Category>;
}
