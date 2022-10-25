import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, tap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Step } from '../models/step.model';
import { Tour } from '../models/tour.model';

const BACKEND_URL = environment.backendURL + '/step';

@Injectable({
  providedIn: 'root'
})
export class StepService {
  private _steps = new BehaviorSubject<Step[]>([]);

  get stepsData(){
    return this._steps.asObservable();
  }

  constructor(
    private http: HttpClient
  ) { }

  fetchSteps(ids: number[]){
    if(ids.length > 0){
      const ids_req = ids.join(",");
      return of(this.http
        .get<Step[]>(`${BACKEND_URL}/filter?ids=${ids_req}`)
        //Filtrer ici pour enlever les étapes terminées
        .pipe(
          map((data) => {
            const steps = data.filter(x => x.leaveAt === null);
            return steps;
          })
        )
        .subscribe((data) => {
          this._steps.next(data);
        }));
    }
  }

  getStepById(id: number, tour: Tour){
    return tour.steps.filter(x => x.id === id);
  }

  // getStepById(id: number){
  //   return new Promise((resolve, reject) => {
  //     this.http
  //       .get(`${BACKEND_URL}/${+id}`)
  //       .subscribe(
  //         (response) => {
  //           console.log(response);
  //           resolve(response);
  //         },
  //         (error) => {
  //           reject(error);
  //         }
  //       );
  //   });
  // }

  markAsArrived(id: number){
    return this.http.put(`${BACKEND_URL}/arrived/${id}`, null);
  }

  startDelivery(id: number){
    return this.http.put(`${BACKEND_URL}/start/${id}`, null);
  }

  // startDelivery(id: number){
  //   let updatedStep: Step[];
  //   return this.stepsData.pipe(
  //     take(1),
  //     switchMap(() => {
  //       return this._steps;
  //     }),
  //     take(1),
  //     switchMap(steps => {
  //       return of(steps);
  //     }),
  //     switchMap(steps => {
  //       const index = steps.findIndex((x) => x.id === id);
  //       updatedStep = [...steps];
  //       const oldStep = updatedStep[index];
  //       updatedStep[index].startAt = new Date();
  //       return this.http
  //       .put(`${BACKEND_URL}/start/${id}`, null);
  //     }),
  //     tap(() => {
  //       this._steps.next(updatedStep);
  //     })
  //   )
  // }

  updateOrder(id: number, data: any){
    return this.http.put<any>(`${environment.backendURL}/order/details/${id}`, data)
    .subscribe(
      {
        next: (v) => {
          if(v.hasOwnProperty("affected") && v.affected > 0){
            return true;
          }
        },
        error: (e) => console.error(e.error.message)
      }
    )
    ;
  }
  markAsDelivered(id: number, data: any){
    return this.http.put(`${BACKEND_URL}/end/${id}`, data);
  }
  // markAsDelivered(id: number, data: any){
  //   // for (let i = 0; i < ordersIds.length; i++) {
  //   //   const element = ordersIds[i];
  //   //   of(this.updateOrder(+element, data));

  //   // }
  //   let updatedStep: Step[];
  //   return this.stepsData.pipe(
  //     take(1),
  //     switchMap(() => {
  //       return this._steps;
  //     }),
  //     take(1),
  //     switchMap(steps => {
  //       return of(steps);
  //     }),
  //     //Mettre à jour les commandes Puis si tout est ok on met à jour l'étape
  //     switchMap(steps => {
  //       const index = steps.findIndex((x) => x.id === id);
  //       updatedStep = [...steps];
  //       const oldStep = updatedStep[index];
  //       updatedStep[index].endAt = new Date();
  //       return this.http
  //       .put(`${BACKEND_URL}/end/${id}`, data);
  //     }),
  //     tap(() => {
  //       this._steps.next(updatedStep);
  //     })
  //   )
  // }

  markAsLeft(id: number){
    return this.http
      .put(`${BACKEND_URL}/left/${id}`, null);
  }
  // markAsLeft(id: number){
  //   let updatedStep: Step[];
  //   return this.stepsData.pipe(
  //     take(1),
  //     switchMap(() => {
  //       return this._steps;
  //     }),
  //     take(1),
  //     switchMap(steps => {
  //       return of(steps);
  //     }),
  //     switchMap(steps => {
  //       const updatedStep = steps.filter((x) => x.id === id);
  //       return this.http
  //       .put(`${BACKEND_URL}/left/${id}`, null);
  //     }),
  //     tap(() => {
  //       this._steps.next(updatedStep);
  //     })
  //   )
  // }
}
