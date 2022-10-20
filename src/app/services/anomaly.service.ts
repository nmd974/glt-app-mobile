import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Anomaly, AnomalyType } from '../models/anomaly.model';
import { ToastService } from './toast.service';

const BACKEND_URL = environment.backendURL;
@Injectable({
  providedIn: 'root'
})
export class AnomalyService {
  private anomalyTypes = new BehaviorSubject<AnomalyType>(null);
  get anomalysData(){
    return this.anomalyTypes.asObservable();
  }

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) { }

  addAnomaly(type: string, data: any){
    // this.http
    // .post(`${BACKEND_URL}/${type}`, data)
    // .subscribe({
    //   error: (e) => {
    //     this.toastService.addMessageError("Echec de l'ajout de l'anomalie")
    //   },
    //   complete: () => this.toastService.addMessage("Anomalie ajoutée"),
    // });

    return new Promise((resolve, reject) => {
      this.http
        .post(`${BACKEND_URL}/${type}`, data)
        .subscribe(
          (response) => {
            resolve(response);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  fetchAnomalyTypes(type: string){
    return this.http
    .get(`${BACKEND_URL}/${type}-type`)
    .subscribe({
      next: (v: any) => {
        this.anomalyTypes.next(v);
      },
      error: (e) => this.toastService.addMessageError(e),
      complete: () => console.info('complete'),
    });

  }

}
