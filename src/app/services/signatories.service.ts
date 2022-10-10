import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Signatory } from '../models/signatory.model';

const BACKEND_URL = environment.backendURL + '/signatory';

@Injectable({
  providedIn: 'root'
})
export class SignatoryService {

  private _signatories = new BehaviorSubject<Signatory[]>([]);

  get signatoriesData(){
    return this._signatories.asObservable();
  }

  constructor(
    private http: HttpClient
  ) { }

  fetchSignatorys(locationId: number){
    this.http
    .get<Signatory[]>(`${BACKEND_URL}/location/${locationId}`)
    .pipe(
      map((data) => {
        const signatories = data.sort((a, b) => a.label.localeCompare(b.label));
        return signatories;
      })
    )
    .subscribe((data) => {
      // console.log(data);
      this._signatories.next(data);
    });
  }


}
