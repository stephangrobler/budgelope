import { EntityMetadataMap } from '@ngrx/data';
import { TransactionID } from './transaction';

export function accountAndCategoryFilter(
  entities: TransactionID[],
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

export function sortDate(a: { date: string }, b: { date: string }) {
  return a.date < b.date ? 1 : -1;
}

const entityMetadata: EntityMetadataMap = {
  Transaction: {
    filterFn: accountAndCategoryFilter,
    sortComparer: sortDate
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
