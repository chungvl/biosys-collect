import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MobileService } from '../shared/services/mobile.service';
import { Site } from '../biosys-core/interfaces/api.interfaces';

@Component({
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.scss'],
})
export class SiteListComponent implements OnInit {
  public sites: Site[];

  ngOnInit() {}
  constructor(private loadingCtrl: LoadingController,
              private alertController: AlertController,
              private router: Router,
              public mobileState: MobileService) {
    return;
  }

  async ionViewWillEnter() {
    this.loadSites();
  }

  private async loadSites() {
    const spinWait = await this.loadingCtrl.create({
      message: 'Loading Sites ...',
    });
    await spinWait.present();

    this.mobileState.getAllSitesForProjectID(this.mobileState.currentProject.id)
    .subscribe(
      async (stuff) => {
        this.sites = stuff;
        await spinWait.dismiss();
        return;
      },
      async (err) => {
        await spinWait.dismiss();
        return;
      });
  }

  addSite() {
    this.router.navigateByUrl('site-add');
  }
}
