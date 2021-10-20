export interface Category {
  _id?: string;
  name: string;
  parentId: string;
  parent?: Category;
  sortingOrder: string;
  balance: number;
  planned: number;
  actual: number;
  type?: string;
}

export interface TransactionCategory {
  name: string;
  in: number;
  out: number;
}
