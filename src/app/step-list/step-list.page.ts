import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Step } from '../models/step.model';
import { Tour } from '../models/tour.model';
import { StepService } from '../services/step.service';
import { TourService } from '../services/tour.service';

@Component({
  selector: 'app-step-list',
  templateUrl: './step-list.page.html',
  styleUrls: ['./step-list.page.scss'],
})
export class StepListPage implements OnInit, OnDestroy {
  loadedSteps: Step[];
  myTour: Tour;
  isLoading: boolean = true;
  private stepSubscription: Subscription;
  private tourSubscription: Subscription;
  private authSubscription: Subscription;
  constructor(
    private stepService: StepService,
    private tourService: TourService,
    private router: Router,
    private authService: AuthService
    ) { }

  ngOnInit() {
    this.authSubscription = this.authService.userId.subscribe(id => {
      this.tourSubscription = this.tourService.toursData.subscribe(data => {
        console.log(data);
        this.myTour = data;
        if(this.myTour && this.myTour.beginAt !== null){
          this.stepSubscription = this.stepService.stepsData.subscribe(data => {
            this.loadedSteps = data;
            this.loadedSteps.forEach(el => {
              let total = 0;
              if(el.orders){
                el.orders.forEach(order => {
                  total += order.details.details[0].palets;
                })
              }
              el.recapToDeliver = total;
            })
            this.isLoading = false;
            // console.log(this.myTour);
          })
          this.stepService.fetchSteps(this.myTour.steps);
        }else{
          this.isLoading = false;
        }
      })
      this.tourService.fetchTours(id);
    })
  }

  beginTour(id: number){
    this.tourService.beginTour(id);
  }

  endTour(id: number){
    this.tourService.endTour(id);
  }

  goToStep(id){
    console.log(id);
    this.router.navigate(['/', 'my-tour', 'tabs', 'step-list', id]);
  }

  ngOnDestroy(): void {
    if(this.stepSubscription){
      this.stepSubscription.unsubscribe();
    }
    if(this.authSubscription){
      this.authSubscription.unsubscribe();
    }
    if(this.tourSubscription){
      this.tourSubscription.unsubscribe();
    }
  }
}
