export class Budget {
  constructor(
    public name: string,
    public start: Date,
    public active: boolean,
    public balance : number,
    public allocations : object,
    public userId?: string,
    public id?: string
  ) { }
}
