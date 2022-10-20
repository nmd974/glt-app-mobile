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
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {

      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }

      this.previousAuthState = isAuth;
      if(this.previousAuthState){
        try {
          let watch = this.geolocation.watchPosition();
          console.log(watch);
          this.watch = watch.subscribe((data: GeolocationPosition) => {
            console.log(data);
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
    });
    this.toastService.getMessageUpdateListener();
    this.snackMessage = this.toastService.messageUpdated.subscribe(async (data: any) => {
      if(data !== ""){
        await this.presentToast(data, 'success');
      }
    })
    this.toastService.getMessageErrorListener();
    this.snackMessageError = this.toastService.messageError.subscribe(async (data: any) => {
      if(data !== ""){
        await this.presentToast(data, 'error');
      }
    })
    App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );


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
          role: 'cancel'
        }
      ],
    });

    await toast.present();
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
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
