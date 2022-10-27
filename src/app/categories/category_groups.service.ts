import { Injectable } from '@angular/core';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { CategoryGroup } from 'app/shared/category_group';

@Injectable({
  providedIn: 'root'
})
export class CategoryGroupService extends EntityCollectionServiceBase<CategoryGroup> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('CategoryGroup', serviceElementsFactory);
  }
 
}
