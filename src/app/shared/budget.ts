export interface Budget {
  name: string;
  start: Date;
  active: boolean;
  balance: number;
  allocations?: { [yearMonth: string]: { income: number; expense: number } };
  sharedWith: string[];
  userId?: string;
  id?: string;  
}
