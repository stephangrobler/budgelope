import { Injectable } from '@angular/core';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { IPayee } from 'app/shared/payee';

@Injectable({
  providedIn: 'root',
})
export class PayeeService extends EntityCollectionServiceBase<IPayee> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Payee', serviceElementsFactory);
  }
}
