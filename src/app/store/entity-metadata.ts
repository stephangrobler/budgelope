import { EntityMetadataMap } from '@ngrx/data';
import { TransactionFilter } from '../transactions/transaction.service';

export function sortDate(a: { date: string }, b: { date: string }) {
  return a.date < b.date ? 1 : -1;
}

const entityMetadata: EntityMetadataMap = {
  Transaction: {
    filterFn: TransactionFilter,
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
