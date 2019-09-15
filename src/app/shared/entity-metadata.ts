import { EntityMetadataMap } from '@ngrx/data';

const entityMetadata: EntityMetadataMap = {
  Transaction: {},
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
