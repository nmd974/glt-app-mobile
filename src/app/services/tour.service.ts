import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { Tour } from '../models/tour.model';

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
    private http: HttpClient
  ) { }

  fetchTours(userId: any){
    const date = new Date();
    this.http
      .get<Tour>(`${BACKEND_URL}/tour/date/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}/user/${userId}`)
      .subscribe((data) => {
        this._tours.next(data);
      });
  }

  beginTour(id: number){
    this.http
    .put(`${BACKEND_URL}/tour/begin/${id}`, null)
    .subscribe({
      next: (v: any) => {
        this._tours.next(v);
      },
      error: (e) => console.error(e.error.message),
      complete: () => console.info('complete'),
    });
  }

  endTour(id: number){
    this.http
    .put(`${BACKEND_URL}/tour/end/${id}`, null)
    .subscribe({
      next: (v: any) => {
        this._tours.next(v);
      },
      error: (e) => console.error(e.error.message),
      complete: () => console.info('complete'),
    });
  }
}
