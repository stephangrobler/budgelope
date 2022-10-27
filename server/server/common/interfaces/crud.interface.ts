export interface CRUD {
  // getWithQuery: (limit: number, page: number) => Promise<any>;
  getWithQuery: (query: any, limit: number, page: number) => Promise<any>;
  add: (resource: any) => Promise<any>;
  update: (key: string, resource: any) => Promise<unknown>;
  getByKey: (val: any, key: string) => Promise<any>;
  delete: (key: string) => Promise<any>;
  patch: (key: string, resource: any) => Promise<any>;
}
