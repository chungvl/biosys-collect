import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { MobileService } from '../shared/services/mobile.service';
import { Site } from '../biosys-core/interfaces/api.interfaces';
import { IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-site-viewer',
  templateUrl: './site-viewer.page.html',
  styleUrls: ['./site-viewer.page.scss'],
})
export class SiteViewerPage {
  public sites: Site[];
  @ViewChild('tabs') tabRef: IonTabs;

  constructor(private loadingCtrl: LoadingController,
              private alertController: AlertController,
              private router: Router,
              public mobileState: MobileService) {
    return;
  }

  public ionicGoBack() {
    this.router.navigateByUrl('form-selector');
  }

  async ionViewWillEnter() {
    this.loadSites();
    this.tabRef.select('list');
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
