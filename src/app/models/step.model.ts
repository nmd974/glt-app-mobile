export class Step{
  constructor(
    public id: number,
    public stepOrder: number,
    public foreseenArrival: Date,
    public arrivedAt: Date,
    public startAt: Date,
    public endAt: Date,
    public leaveAt: Date,
    public reportDate: Date,
    public comments: string,
    public label: string,
    public orders?: any,
    public recapToDeliver?: any,
    // public enCours?: boolean,On va looper sur les tournées et s'il y a en a une avec début et pas fin alors on va vers cette étape
  ){}
}
