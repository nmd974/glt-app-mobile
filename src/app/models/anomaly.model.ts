import { Step } from "./step.model";
import { Tour } from "./tour.model";

export class Anomaly{
  id: number;
  photo: File;
  comment: string;
}

export class TourAnomaly extends Anomaly{
  tour: Tour;
}

export class StepAnomaly extends Anomaly{
  step: Step;
}

export class OrderAnomaly extends Anomaly{
  order: any;
}

export class AnomalyType{
  id: number;
  label: string;
}
