import { Observable } from 'rxjs/Observable';

export class Category {
  $key?: string;
  id?: string;
  name: string;
  parent: string;
  parentId: string;
  sortingOrder: string;
  balance: number;
  children?: any;
  type?: string;
  allocations?: object;
}

export interface CategoryId extends Category { id: string };
