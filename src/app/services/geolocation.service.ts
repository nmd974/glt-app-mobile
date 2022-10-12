import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class GeolocationService {

  geolocations: Subject<any>;

  // Our constructor calls our wsService connect method
  constructor(private wsService: WebsocketService) {
    this.geolocations = <Subject<any>>wsService
      .connect()
      // .map((response: any): any => {
      //   return response;
      // })
   }

  // Our simplified interface for sending
  // geolocations back to our socket.io server
  sendMsg(data) {
    this.geolocations.next(data);
  }

}
