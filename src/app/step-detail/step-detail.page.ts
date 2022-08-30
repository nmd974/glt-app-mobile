import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { of, Subscription } from 'rxjs';
import { Step } from '../models/step.model';
import { StepService } from '../services/step.service';
import SignaturePad from 'signature_pad';
import { FormArray, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Signatory } from '../models/signatory.model';
import { SignatoryService } from '../services/signatories.service';

@Component({
  selector: 'app-step-detail',
  templateUrl: './step-detail.page.html',
  styleUrls: ['./step-detail.page.scss'],
})
export class StepDetailPage implements OnInit, OnDestroy, AfterViewInit, OnChanges  {

  @ViewChild('canvas') canvasEl : ElementRef;
  signaturePad: SignaturePad;
  step: Step = null;
  signatories: Signatory[] = null;
  idConcerned: number = 0;
  isLoading: boolean = true;
  deliveryForm: FormGroup;
  private stepSubscription: Subscription;
  private signsSubscription: Subscription;
  constructor(
    private loadingCtrl: LoadingController,
    private actualRoute: ActivatedRoute,
    private stepService: StepService,
    private router: Router,
    private alertController: AlertController,
    private signatoryService: SignatoryService,
  ) { }

  ngOnInit() {
    /**
     * Si pas encore arrivée alors bouton "je suis arrivé"
     * Si pas encore commencé à déchargé "Décharger"
     * Afficher le contenu de la commande en formulaire + bouton terminer
     * Commentaires + bouton quitter puis redirect vers liste des livraisons
     */
    this.stepSubscription = this.stepService.stepsData.subscribe(data => {
      const stepData = data.filter(x => x.id === parseInt(this.actualRoute.snapshot.params.stepId));
      if(stepData){
        this.step = stepData[0];
        this.idConcerned = this.step.id;
        console.log(this.step);
        if(this.step.startAt !== null && this.step.leaveAt === null){
          this.signsSubscription = this.signatoryService.signatoriesData.subscribe(signs => {
            this.signatories = signs;
            this.initForm();
          });
          this.signatoryService.fetchSignatorys(this.step.orders[0].locationId);
        }
        this.isLoading = false;
      }
    })
  }

  ngAfterViewInit() {
    if(this.step.startAt !== null && this.step.leaveAt === null){
      this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.step.startAt !== null && this.step.leaveAt === null){
      this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
      if(this.signatories === null){
        this.signsSubscription = this.signatoryService.signatoriesData.subscribe(signs => {
          this.signatories = signs;
          this.initForm();
        });
        this.signatoryService.fetchSignatorys(this.step.orders[0].details.details[0].locationId);
      }
    }
  }

  initForm(){
    let paletsForm = new FormArray([]);
    for (const order of this.step.orders) {
      paletsForm.push(
        new FormGroup({
          'reference': new FormControl(order.reference),
          'paletsQty': new FormControl(order.details.details[0].palets, [
            Validators.required,
            Validators.pattern(/^[1-9]+[0-9]*$/)
          ])
        })
      )
    }
    this.deliveryForm = new FormGroup({
      'signatureRefused': new FormControl(false),
      'signatory': new FormControl(this.signatories),
      'palets': paletsForm
    });
  }

  get paletsForm(){
    return this.deliveryForm.controls["palets"] as FormArray;
  }

  clearPad() {
    this.signaturePad.clear();
  }

  async markAsArrived(){
    this.loadingCtrl
    .create({
      message: 'Chargement...'
    })
    .then(loadingEl => {
      loadingEl.present();
      this.stepService
      .markAsArrived(this.idConcerned)
      .subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  startDelivery(){
    this.loadingCtrl
    .create({
      message: 'Chargement...'
    })
    .then(loadingEl => {
      loadingEl.present();
      this.stepService
      .startDelivery(this.idConcerned)
      .subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }

  async markAsDelivered(){
    if(this.deliveryForm.valid){
      if(this.signaturePad.isEmpty() && !this.deliveryForm.controls["signatureRefused"].value && this.deliveryForm.controls["signatory"].value === ""){
        const alert = await this.alertController.create({
          header: 'Validation impossible',
          message: 'Veuillez renseigner le signataire et faire signer la livraison, ou cochez le refus de signature',
          buttons: ['OK'],
        });

        await alert.present();
        return;
      }
      else if(!this.signaturePad.isEmpty() && this.deliveryForm.controls["signatory"].value === ""){
        const alert = await this.alertController.create({
          header: 'Validation impossible',
          message: 'Veuillez renseigner le signataire, ou cochez le refus de signature',
          buttons: ['OK'],
        });

        await alert.present();
        return;
      }
      else if(this.deliveryForm.controls["signatory"].value !== "" && this.signaturePad.isEmpty() && !this.deliveryForm.controls["signatureRefused"].value){
        const alert = await this.alertController.create({
          header: 'Validation impossible',
          message: 'Veuillez faire signer la livraison, ou cochez le refus de signature',
          buttons: ['OK'],
        });

        await alert.present();
        return;
      }

      for (const order of this.step.orders) {
        this.deliveryForm.value.palets.forEach(async element => {
          if(order.reference === element.reference){
            console.log(element.paletsQty);
            const orderUpdated = {
              details: {
                "details":[
                  {
                    "palets": order.details.details[0].palets,
                    "packgings": order.details.details[0].packgings,
                    "weight": order.details.details[0].weight,
                    "deliveredPalets": element.paletsQty
                  }
                ]
              },
            }
            console.log(orderUpdated);
            of(this.stepService.updateOrder(order.id, orderUpdated));
          }
        });
      }
      let stepUpdated = null;
      if(this.deliveryForm.controls["signatureRefused"].value){
        stepUpdated = {
          signatory: null,
          signature: null,
          signatureRefused: true
        }
      }else{
        stepUpdated = {
          signatory: this.deliveryForm.controls["signatory"].value,
          signature: this.signaturePad.toDataURL(),
          signatureRefused: false
        }
      }
      this.loadingCtrl
      .create({
        message: 'Chargement...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.stepService
        .markAsDelivered(this.idConcerned, stepUpdated)
        .subscribe(() => {
          loadingEl.dismiss();
        });
      });

    }
  }

  markAsLeft(){
    this.loadingCtrl
    .create({
      message: 'Chargement...'
    })
    .then(loadingEl => {
      loadingEl.present();
      this.stepService
      .markAsLeft(this.idConcerned)
      .subscribe(() => {
        loadingEl.dismiss();
      });
    });
    this.router.navigateByUrl('/my-tour/tabs/step-list');
  }

  removePalet(i){
    // const order = this.step.orders.filter(x => x.id === id);
    // if(order){
    //   order[0].details.details[0].palets -= 1;
    // }
    const oldValue = this.paletsForm.controls[i].value.paletsQty;
    const newVal = this.paletsForm.controls[i].value.paletsQty = oldValue - 1;
    if(newVal > 0){
      this.paletsForm.controls[i].setValue({
        'paletsQty': newVal,
        'reference': this.paletsForm.controls[i].value.reference
      });
    }
  }

  addPalet(i){
    // const order = this.step.orders.filter(x => x.id === id);
    // if(order){
    //   order[0].details.details[0].palets += 1;
    // }
    const oldValue = this.paletsForm.controls[i].value.paletsQty;
    const newVal = this.paletsForm.controls[i].value.paletsQty = oldValue + 1;
    this.paletsForm.controls[i].setValue({
      'paletsQty': newVal,
      'reference': this.paletsForm.controls[i].value.reference
    });
    // console.log(this.paletsForm.controls[i].controls.paletsQty.setValue(oldValue + 1));
    // console.log((<FormArray>this.deliveryForm.get('palets')).controls[i].control);
  }

  ngOnDestroy(): void {
    if(this.stepSubscription){
      this.stepSubscription.unsubscribe();
    }
    if(this.signsSubscription){
      this.signsSubscription.unsubscribe();
    }
  }

}
