import { EntityMetadataMap } from '@ngrx/data';
import { ITransactionID } from './transaction';

export function accountAndCategoryFilter(
  entities: ITransactionID[],
  pattern: any
) {
  if (pattern.accountId) {
    return entities.filter(
      entity => entity.account.accountId === pattern.accountId
    );
  } else {
    return entities;
  }
}

const entityMetadata: EntityMetadataMap = {
  Transaction: {
    filterFn: accountAndCategoryFilter
  },
  Account: {},
  Category: {},
  Budget: {}
};

const pluralNames = {
  Category: 'Categories'
};

export const entityConfig = {
  entityMetadata,
  pluralNames
};
