import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs';

import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Capacitor } from '@capacitor/core';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@Injectable()
export class GeolocationService {
  geolocations: Subject<any>;

  // Our constructor calls our wsService connect method
  constructor(private wsService: WebsocketService) {}

  // Our simplified interface for sending
  // geolocations back to our socket.io server
  sendMsg(data) {
    this.geolocations.next(data);
  }

  async connect(){
    this.geolocations = <Subject<any>>this.wsService.connect();
    return;
  }

  async askToTurnOnGPS(): Promise<boolean> {
    return await new Promise((resolve, reject) => {
        LocationAccuracy.canRequest().then((canRequest: boolean) => {
            if (canRequest) {
                // the accuracy option will be ignored by iOS
                LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                    () => {
                        resolve(true);
                    },
                    error => { resolve(false); }
                );
            }
            else { resolve(false); }
        });
    })
}

  // Check if application having GPS access permission
  async checkGPSPermission(): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      if (Capacitor.isNative) {
        AndroidPermissions.checkPermission(
          AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION
        ).then(
          (result) => {
            if (result.hasPermission) {
              // If having permission show 'Turn On GPS' dialogue
              resolve(true);
            } else {
              // If not having permission ask for permission
              resolve(false);
            }
          },
          (err) => {
            alert(err);
          }
        );
      } else {
        resolve(true);
      }
    });
  }
  async requestGPSPermission(): Promise<string> {
    return await new Promise((resolve, reject) => {
      LocationAccuracy.canRequest().then((canRequest: boolean) => {
        if (canRequest) {
          resolve('CAN_REQUEST');
        } else {
          // Show 'GPS Permission Request' dialogue
          AndroidPermissions.requestPermission(
            AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION
          ).then(
            (result) => {
              if (result.hasPermission) {
                // call method to turn on GPS
                resolve('GOT_PERMISSION');
              } else {
                resolve('DENIED_PERMISSION');
              }
            },
            (error) => {
              // Show alert if user click on 'No Thanks'
              alert(
                'requestPermission Error requesting location permissions ' +
                  error
              );
            }
          );
        }
      });
    });
  }
}
