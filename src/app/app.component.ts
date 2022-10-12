import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { App, AppState } from '@capacitor/app';
import { Capacitor, Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { WebsocketService } from './services/websocket.service';
import { GeolocationService } from './services/geolocation.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private authSub: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private geolocation: Geolocation,
    private geolocationService: GeolocationService,
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
      let watch = this.geolocation.watchPosition();
      watch.subscribe((data) => {
        console.log(data);
        this.sendPosition(data);
      });
    });
    App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );


  }

  sendPosition(data: any) {
    let position = {
      latitude: '',
      longitude: ''
    };
    position.latitude = data.coords.latitude;
    position.longitude = data.coords.longitude;
    this.geolocationService.sendMsg(position);
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
