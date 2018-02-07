import { Observable } from 'rxjs/Observable';

export class Category {
  $key?: string;
  name: string;
  parent: string;
  parentId: string;
  sortingOrder: string;
  balance: number;
  children?: any;
  type?: string;
}
