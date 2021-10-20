import { EntityMetadataMap } from '@ngrx/data';
import { TransactionFilter } from '../transactions/transaction.service';

export function sortDate(a: { date: string }, b: { date: string }) {
  return a.date < b.date ? 1 : -1;
}

const entityMetadata: EntityMetadataMap = {
  Transaction: {
    filterFn: TransactionFilter,
    sortComparer: sortDate,
    selectId: (transaction) => transaction._id,
  },
  Account: {
    selectId: (account) => account._id,
  },
  Category: {
    selectId: (category) => category._id,
  },
  Budget: {
    selectId: (budget) => budget._id,
  },
  Payee: {
    selectId: (payee) => payee._id,
  },
};

const pluralNames = {
  Category: 'Categories',
  Budget: 'Budgets',
};

export const entityConfig = {
  entityMetadata,
  pluralNames,
};
