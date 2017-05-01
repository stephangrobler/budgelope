export class Budget {
  constructor(
    public name: string,
    public start: Date,
    public active: boolean,
    public userId: string,
    public id?: string
  ) { }
}
