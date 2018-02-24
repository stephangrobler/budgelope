export class Budget {

  public name: string;
  public start: Date;
  public active: boolean;
  public balance: number;
  public allocations: object;
  public sharedWith: string[];
  public userId?: string;
  public id?: string;


  constructor(budgetData? : any ) {
    if(budgetData){
      this.id = budgetData.id ? budgetData.id : null ;
      this.name = budgetData.name ? budgetData.name : null ;
      this.start = budgetData.start ? budgetData.start : null ;
      this.active = budgetData.active ? budgetData.active : null ;
      this.balance = budgetData.balance ? budgetData.balance : null ;
      this.allocations = budgetData.allocations ? budgetData.allocations : null ;
      this.userId = budgetData.userId ? budgetData.userId : null ;
    }
  }
}
