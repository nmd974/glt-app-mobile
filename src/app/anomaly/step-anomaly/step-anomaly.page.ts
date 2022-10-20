import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AnomalyService } from 'src/app/services/anomaly.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-step-anomaly',
  templateUrl: './step-anomaly.page.html',
  styleUrls: ['./step-anomaly.page.scss'],
})
export class StepAnomalyPage implements OnInit {
  private anomalySub: Subscription;
  isLoading: boolean = true;
  types: any;
  steps: any;
  anomalyForm: FormGroup;
  fb: FormBuilder;
  currentAnomalyType: string = 'step';
  constructor(private anomalyService: AnomalyService, private router: Router, private toastService: ToastService) { }

  ngOnInit() {
    this.steps = this.router.getCurrentNavigation().extras.state;
    if(!this.steps){
      this.router.navigate(['/', 'my-tour', 'tabs', 'anomaly']);
    }
    this.anomalySub = this.anomalyService.anomalysData.subscribe(data => {
      this.types = data;
      this.anomalyForm = new FormGroup({
        'type': new FormControl(this.types),
        'step': new FormControl(this.steps),
        'comment': new FormControl(''),
      });
      console.log(this.anomalyForm.value['step']);
      // this.anomalyForm.addControl(this.currentAnomalyType, FormControl);
      this.anomalyForm.controls['comment'].setValidators([Validators.required, Validators.maxLength(255), Validators.minLength(2)]);
      this.anomalyForm.controls['type'].setValidators([Validators.required]);
      this.anomalyForm.controls['step'].setValidators([Validators.required]);
      this.isLoading = false;
    })
    this.anomalyService.fetchAnomalyTypes('step-anomaly');
  }

  submit(){
    if(this.anomalyForm.valid){
      console.log(this.anomalyForm);
      const data = {
        comment: this.anomalyForm.value.comment,
        type: this.anomalyForm.value.type,
        step: this.steps.filter((x: { id: any; }) => x.id === this.anomalyForm.value.step)[0],
      }
      this.anomalyService.addAnomaly('step-anomaly', data)
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
