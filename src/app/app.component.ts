import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App, AppState } from '@capacitor/app';
import { Capacitor, Plugins } from '@capacitor/core';
import { Platform, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
// import { Geolocation } from '@capacitor/geolocation';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { WebsocketService } from './services/websocket.service';
import { GeolocationService } from './services/geolocation.service';
import { ToastService } from './services/toast.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  watchCoordinate: any;
  watch: any;
  watchId: number;
  private authSub: Subscription;
  private previousAuthState = false;
  private snackMessage: Subscription = new Subscription();
  private snackMessageError: Subscription = new Subscription();
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private geolocation: Geolocation,
    private geolocationService: GeolocationService,
    private toastService: ToastService,
    private toastController: ToastController,
    private zone: NgZone
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.clearWatch();
        this.router.navigateByUrl('/auth');
      }

      this.previousAuthState = isAuth;

      if (this.previousAuthState) {
        //Lancement de la géolocalisation
        this.manageGeolocation();
      }

    });

    //Toast service global
    this.toastService.getMessageUpdateListener();
    this.snackMessage = this.toastService.messageUpdated.subscribe(
      async (data: any) => {
        if (data !== '') {
          await this.presentToast(data, 'success');
        }
      }
    );
    this.toastService.getMessageErrorListener();
    this.snackMessageError = this.toastService.messageError.subscribe(
      async (data: any) => {
        if (data !== '') {
          await this.presentToast(data, 'error');
        }
      }
    );

    App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
  }

  async presentToast(message: string, type: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top',
      color: type,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }

  async manageGeolocation() {
    const hasPermission = await this.geolocationService.checkGPSPermission();
    if (hasPermission) {
      if (Capacitor.isNative) {
        const canUseGPS = await this.geolocationService.askToTurnOnGPS();
        this.postGPSPermission(canUseGPS);
      } else {
        this.postGPSPermission(true);
      }
    } else {
      const permission = await this.geolocationService.requestGPSPermission();
      if (permission === 'CAN_REQUEST' || permission === 'GOT_PERMISSION') {
        if (Capacitor.isNative) {
          const canUseGPS = await this.geolocationService.askToTurnOnGPS();
          this.postGPSPermission(canUseGPS);
        } else {
          this.postGPSPermission(true);
        }
      } else {
        this.toastService.addMessageError('Veuillez activer le GPS');
      }
    }
  }

  async postGPSPermission(canUseGPS: boolean) {
    if (canUseGPS) {
      this.watchPosition();
    } else {
      this.toastService.addMessageError('Veuillez activer le GPS');
    }
  }

  async watchPosition() {
    try {
      let watch = this.geolocation.watchPosition();
      console.log(watch);
      this.watch = watch.subscribe((data: GeolocationPosition) => {
        this.watchCoordinate = {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
        };
        this.sendPosition();
      });
    } catch (e) {
      console.error(e);
    }
  }

  clearWatch() {
    if (this.watchId != null) {
      this.watch.clearWatch({ id: this.watchId });
    }
  }

  sendPosition() {
    this.geolocationService.sendMsg(this.watchCoordinate);
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if(this.watch){
      this.watch.unsubscribe();
    }
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe((success) => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
