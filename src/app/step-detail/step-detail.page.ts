import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Step } from '../models/step.model';
import { StepService } from '../services/step.service';
import SignaturePad from 'signature_pad';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-step-detail',
  templateUrl: './step-detail.page.html',
  styleUrls: ['./step-detail.page.scss'],
})
export class StepDetailPage implements OnInit, OnDestroy, AfterViewInit, OnChanges  {

  @ViewChild('canvas') canvasEl : ElementRef;
  signaturePad: SignaturePad;
  step: Step = null;
  idConcerned: number = 0;
  isLoading: boolean = true;
  private stepSubscription: Subscription;
  constructor(
    private loadingCtrl: LoadingController,
    private actualRoute: ActivatedRoute,
    private stepService: StepService,
    private router: Router,
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
        this.isLoading = false;
      }
    })
  }

  ngAfterViewInit() {
    if(this.step.startAt !== null){
      this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.step.startAt !== null){
      this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
    }
  }

  startDrawing(event: Event) {
    console.log(event);
    // works in device not in browser

  }

  moved(event: Event) {
    // works in device not in browser
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

  markAsDelivered(form: NgForm){
    // this.loadingCtrl
    // .create({
    //   message: 'Chargement...'
    // })
    // .then(loadingEl => {
    //   loadingEl.present();
    //   this.stepService
    //   .markAsDelivered(this.idConcerned)
    //   .subscribe(() => {
    //     loadingEl.dismiss();
    //   });
    // });
    console.log(form);
    if(this.signaturePad.isEmpty()){
      //pas submit
    }
    console.log(this.signaturePad);
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

  removePalet(id){
    const order = this.step.orders.filter(x => x.id === id);
    if(order){
      order[0].details.details[0] -= 1;
    }
  }

  addPalet(id){
    const order = this.step.orders.filter(x => x.id === id);
    if(order){
      order[0].details.details[0] += 1;
    }
  }

  ngOnDestroy(): void {
    if(this.stepSubscription){
      this.stepSubscription.unsubscribe();
    }
  }

}
