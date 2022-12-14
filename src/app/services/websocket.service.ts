import { Injectable } from '@angular/core';
// import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import * as Rx from 'rxjs';
import { environment } from 'src/environments/environment';
import { io } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class WebsocketService {

  // Our socket connection
  private socket;
  authToken: string = "";
  constructor(private authService: AuthService) { }

  connect(): Rx.Subject<MessageEvent> {
    this.authService.token.subscribe(token => {
      this.authToken = token;
      this.socket = io(environment.backendURL, {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${this.authToken}`,
            }
          }
        }
      });
    })

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    // let observable = new Observable(observer => {
    //     this.socket.on('message', (data) => {
    //       console.log("Received message from Websocket Server")
    //       observer.next(data);
    //     })
    //     return () => {
    //       this.socket.disconnect();
    //     }
    // });

    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.
    let observer = {
        next: (data: Object) => {
            this.socket.emit('geolocation', data);
        },
    };

    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return Rx.Subject.create(observer);
  }

}
