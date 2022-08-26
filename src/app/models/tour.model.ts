export class Tour{
  constructor(
    public id: number,
    public beginAt: Date,
    public endAt: Date,
    public steps: number[],
  ){}
}
