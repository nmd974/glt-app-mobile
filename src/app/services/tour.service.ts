import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Tour } from '../models/tour.model';
import { ToastService } from './toast.service';

const BACKEND_URL = environment.backendURL;
@Injectable({
  providedIn: 'root'
})
export class TourService {
  private _tours = new BehaviorSubject<Tour>(null);
  get toursData(){
    return this._tours.asObservable();
  }

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) { }

  fetchTours(userId: any){
    const date = new Date();
    return this.http
      .get<Tour>(`${BACKEND_URL}/tour/date/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}/user/${userId}`)
      .subscribe({
        next: (data) => {
          this._tours.next(data);
        },
        error: (error) => this.toastService.addMessageError(error.error.message)

      });
  }

  beginTour(id: number){
    return this.http
    .put(`${BACKEND_URL}/tour/begin/${id}`, null)
    .subscribe({
      next: (v: any) => {
        this._tours.next(v);
      },
      error: (e) => this.toastService.addMessageError(e.error.message),
      complete: () => this.toastService.addMessage('Votre tournée a commencé'),
    });
  }

  endTour(id: number){
    return this.http
    .put(`${BACKEND_URL}/tour/end/${id}`, null)
    .subscribe({
      next: (v: any) => {
        this._tours.next(v);
      },
      error: (e) => this.toastService.addMessageError(e.error.message),
      complete: () => this.toastService.addMessage('Votre tournée est terminée'),
    });
  }
}
