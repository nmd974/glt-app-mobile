import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AnomalyService } from 'src/app/services/anomaly.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-order-anomaly',
  templateUrl: './order-anomaly.page.html',
  styleUrls: ['./order-anomaly.page.scss'],
})
export class OrderAnomalyPage implements OnInit {
  private anomalySub: Subscription;
  isLoading: boolean = true;
  types: any;
  data: any;
  orders: any[] = [];
  anomalyForm: FormGroup;
  fb: FormBuilder;
  currentAnomalyType: string = 'order';
  constructor(private anomalyService: AnomalyService, private router: Router, private toastService: ToastService) { }

  async ngOnInit() {
    this.data = this.router.getCurrentNavigation().extras.state;
    if(this.data){
      await this.storeOrder();
    }
    if(this.orders.length < 1){
      this.router.navigate(['/', 'my-tour', 'tabs', 'anomaly']);
    }
    this.anomalySub = this.anomalyService.anomalysData.subscribe(data => {
      this.types = data;
      this.anomalyForm = new FormGroup({
        'type': new FormControl(this.types),
        'order': new FormControl(this.orders),
        'comment': new FormControl(''),
      });
      console.log(this.anomalyForm.value['order']);
      // this.anomalyForm.addControl(this.currentAnomalyType, FormControl);
      this.anomalyForm.controls['comment'].setValidators([Validators.required, Validators.maxLength(255), Validators.minLength(2)]);
      this.anomalyForm.controls['type'].setValidators([Validators.required]);
      this.anomalyForm.controls['order'].setValidators([Validators.required]);
      this.isLoading = false;
    })
    this.anomalyService.fetchAnomalyTypes('order-anomaly');
  }

  submit(){
    if(this.anomalyForm.valid){
      console.log(this.anomalyForm);
      const data = {
        comment: this.anomalyForm.value.comment,
        type: this.anomalyForm.value.type,
        order: this.orders.filter((x: { id: any; }) => x.id === this.anomalyForm.value.order)[0],
      }
      this.anomalyService.addAnomaly('order-anomaly', data)
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

  async storeOrder(){
    for (const step of this.data) {
      if(step.orders){
        console.log(step.orders);
        for (const order of step.orders) {
          this.orders.push(order);
        }
      }
    }
  }

}
