import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToastService{
  public messageUpdated = new Subject<any>();
  public messageError = new Subject<any>();

  constructor(private http: HttpClient) {}

    getMessageUpdateListener() {
      return this.messageUpdated.asObservable();
    }

    getMessageErrorListener() {
      return this.messageError.asObservable();
    }

    addMessage(message: string){
      this.messageUpdated.next(message);
    }

    addMessageError(message: string){
      this.messageError.next(message);
    }

}
