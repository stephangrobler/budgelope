
export interface Category {
  id?: string;
  name: string;
  parent: string;
  parentId: string;
  sortingOrder: string;
  balance: number;
  children?: any;
  type?: string;
  allocations?: { [s: string]: { actual: number, planned: number} };
}

export interface TransactionCategory {
  name: string;
  in: number;
  out: number;
}

