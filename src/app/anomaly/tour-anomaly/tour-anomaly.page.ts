import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AnomalyService } from 'src/app/services/anomaly.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-tour-anomaly',
  templateUrl: './tour-anomaly.page.html',
  styleUrls: ['./tour-anomaly.page.scss'],
})
export class TourAnomalyPage implements OnInit {
  private anomalySub: Subscription;
  isLoading: boolean = true;
  types: any;
  tours: any;
  anomalyForm: FormGroup;
  fb: FormBuilder;
  currentAnomalyType: string = 'tour';
  constructor(private anomalyService: AnomalyService, private router: Router, private toastService: ToastService) { }

  ngOnInit() {
    this.tours = this.router.getCurrentNavigation().extras.state;
    if(!this.tours){
      this.router.navigate(['/', 'my-tour', 'tabs', 'anomaly']);
    }
    this.anomalySub = this.anomalyService.anomalysData.subscribe(data => {
      this.types = data;
      this.anomalyForm = new FormGroup({
        'type': new FormControl(this.types),
        'comment': new FormControl(''),
      });
      console.log(this.anomalyForm.value['tour']);
      // this.anomalyForm.addControl(this.currentAnomalyType, FormControl);
      this.anomalyForm.controls['comment'].setValidators([Validators.required, Validators.maxLength(255), Validators.minLength(2)]);
      this.anomalyForm.controls['type'].setValidators([Validators.required]);
      this.isLoading = false;
    })
    this.anomalyService.fetchAnomalyTypes('tour-anomaly');
  }

  submit(){
    if(this.anomalyForm.valid){
      console.log(this.anomalyForm);
      const data = {
        comment: this.anomalyForm.value.comment,
        type: this.anomalyForm.value.type,
        tour: this.tours.filter((x: { id: any; }) => x.id === this.anomalyForm.value.tour)[0],
      }
      this.anomalyService.addAnomaly('tour-anomaly', data)
      .then((res) => {
        this.toastService.addMessage('Anomalie ajoutée avec succès');
        setTimeout(() => {
          this.router.navigate(['/', 'my-tour', 'tabs', 'anomaly']);
        }, 1500);
      })
      .catch((err) => {
        this.toastService.addMessage(err.error.message);
      })
    }
  }

}
