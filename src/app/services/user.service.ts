import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast.service';

const BACKEND_URL = environment.backendURL;
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) { }

  getUserInfos(id: string){
    return new Promise((resolve, reject) => {
      this.http
        .get(`${BACKEND_URL}/user/${+id}`)
        .subscribe(
          (response) => {
            resolve(response);
          },
          (error) => {
            this.toastService.addMessageError(error)
            reject(error);
          }
        );
    });
  }

}
