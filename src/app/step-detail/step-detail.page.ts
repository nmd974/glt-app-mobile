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
import { Tour } from '../models/tour.model';

@Component({
  selector: 'app-step-detail',
  templateUrl: './step-detail.page.html',
  styleUrls: ['./step-detail.page.scss'],
})
export class StepDetailPage implements OnInit, OnDestroy, AfterViewInit, OnChanges  {

  @ViewChild('canvas') canvasEl : ElementRef;
  signaturePad: SignaturePad;
  step: Step;
  signatories: Signatory[] = [];
  idConcerned: number = 0;
  isLoading: boolean = true;
  deliveryForm: FormGroup;
  tour: Tour | any;
  formInit : boolean = false;
  private stepSubscription: Subscription;
  private signsSubscription: Subscription;
  constructor(
    private loadingCtrl: LoadingController,
    private actualRoute: ActivatedRoute,
    private stepService: StepService,
    private router: Router,
    private alertController: AlertController,
    private signatoryService: SignatoryService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit(): Promise<void> {
    /**
     * Si pas encore arrivée alors bouton "je suis arrivé"
     * Si pas encore commencé à déchargé "Décharger"
     * Afficher le contenu de la commande en formulaire + bouton terminer
     * Si fin de déchargement bouton quitter puis redirect vers liste des livraisons
     */

    this.tour = this.router.getCurrentNavigation().extras.state;
    console.log(this.tour);
    // if(!this.tour){
    //   this.router.navigateByUrl('/my-tour/tabs/step-list');
    // }
    const data = this.stepService.getStepById(parseInt(this.actualRoute.snapshot.params.stepId), this.tour);
    if(data.length > 0){
      console.log(data);
      this.step = data[0];
      this.idConcerned = this.step.id;
      this.signatories.push({id: 0, label: "Autre"});
      if(this.step.orders[0].location.signatories.length > 0){
        this.signatories.push(this.step.orders[0].location.signatories);
      }
      if(this.step.startAt !== null && this.step.endAt === null && this.step.leaveAt === null){
        this.initForm(true);
      }
      this.isLoading = false;
    }
    else{
      this.router.navigateByUrl('/my-tour/tabs/step-list');
    }
  }


  ngAfterViewInit() {
    console.log("view init");
    if(this.step && this.step.startAt !== null && this.step.endAt === null){
      if(!this.signaturePad){
        this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("change");
    if(this.step && this.step.startAt !== null && this.step.endAt === null){
      this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
      if(this.signatories === null){
        this.signsSubscription = this.signatoryService.signatoriesData.subscribe(signs => {
          this.signatories = signs;
        });
        this.signatoryService.fetchSignatorys(this.step.orders[0].details.details[0].locationId);
      }
      if(!this.formInit){
        this.initForm();
      }
    }
  }

  // ngAfterContentChecked(): void {
  //   //Called after every check of the component's or directive's content.
  //   //Add 'implements AfterContentChecked' to the class.
  //   console.log("contentchecked")
  //   if(this.step && this.step.startAt !== null && this.step.endAt === null && !this.formInit){
  //     this.initForm();
  //     if(!this.signaturePad){
  //       this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  //     }
  //   }
  // }

  async initForm(fromInit: boolean = false){
    if(!this.formInit){
      let paletsForm = new FormArray([]);
      for (const order of this.step.orders) {
        console.log(order);
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
        'signatory': new FormControl(""),
        'palets': paletsForm
      });
      if(!fromInit && !this.signaturePad && this.signatories.length > 0){
        setTimeout(() => {
          this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
        }, 2000);
      }
      this.formInit = true;
    }

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
      this.step.arrivedAt = new Date();
      this.stepService
      .markAsArrived(this.idConcerned)
      .subscribe((data) => {
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
      this.step.startAt = new Date();
      this.stepService
      .startDelivery(this.idConcerned)
      .subscribe(() => {
        loadingEl.dismiss();
        this.initForm();
      });
    });
  }

  async markAsDelivered(){
    if(this.deliveryForm.valid){
      console.log(this.deliveryForm);
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
          signatory: this.deliveryForm.controls["signatory"].value === "Autre" ? null : this.deliveryForm.controls["signatory"].value,
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
        this.step.endAt = new Date();
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
      this.step.leaveAt = new Date();
      this.stepService
      .markAsLeft(this.idConcerned)
      .subscribe(() => {
        loadingEl.dismiss();
        this.router.navigateByUrl('/');
      });
    });
  }

  removePalet(i: string | number){
    const oldValue = this.paletsForm.controls[i].value.paletsQty;
    const newVal = oldValue - 1;
    console.log(newVal);
    if(newVal > 0){
      this.paletsForm.controls[i].setValue({
        'paletsQty': newVal,
        'reference': this.paletsForm.controls[i].value.reference
      });
    }
  }

  addPalet(i: string | number){
    const oldValue = this.paletsForm.controls[i].value.paletsQty;
    const newVal = oldValue + 1;
    this.paletsForm.controls[i].setValue({
      'paletsQty': newVal,
      'reference': this.paletsForm.controls[i].value.reference
    });
  }

  getInfoOnRemovePalet(){
    this.alertCtrl
      .create({
        header: 'Informations',
        message: 'Veuillez signaler une anomalie',
        buttons: ['Ok']
      })
      .then(alertEl => alertEl.present());
  }

  ngOnDestroy(): void {
    console.log("DESTROY");
    if(this.stepSubscription){
      this.stepSubscription.unsubscribe();
    }
    if(this.signsSubscription){
      this.signsSubscription.unsubscribe();
    }
  }

}
