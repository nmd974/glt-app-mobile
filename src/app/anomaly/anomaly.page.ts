import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Tour } from '../models/tour.model';
import { TourService } from '../services/tour.service';

@Component({
  selector: 'app-anomaly',
  templateUrl: './anomaly.page.html',
  styleUrls: ['./anomaly.page.scss'],
})
export class AnomalyPage implements OnInit, OnDestroy {
  isLoading: boolean = true;
  myTour: Tour;
  private tourSubscription: Subscription;
  private authSubscription: Subscription;
  constructor(
    private tourService: TourService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authSubscription = this.authService.userId.subscribe(id => {
      if(id){
        this.tourSubscription = this.tourService.toursData.subscribe(data => {
          console.log(data);
          if(data){
            this.myTour = data;
            this.isLoading = false;
          }

        })
        this.tourService.fetchTours(id);
      }

    })
  }

  redirectTo(type: string){
    if(this.myTour && this.myTour.steps){
      switch (type) {
        case 'step-anomaly':
          this.router.navigate(['/', 'my-tour', 'tabs', 'anomaly', type], {state: this.myTour.steps});
          break;
        case 'order-anomaly':
          this.router.navigate(['/', 'my-tour', 'tabs', 'anomaly', type], {state: this.myTour.steps});
          break;

        default:
          this.router.navigate(['/', 'my-tour', 'tabs', 'anomaly', 'tour-anomaly'], {state: this.myTour});
          break;
      }
    }

  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.tourSubscription.unsubscribe();
  }
}
