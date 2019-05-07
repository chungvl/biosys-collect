import { SqliteTestPage } from '../sqlite-test/sqlite-test.page';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MobileService } from '../shared/services/mobile.service';
import { AlertController, LoadingController } from '@ionic/angular';

import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.page.html',
  styleUrls: ['./project-selector.page.scss'],
})
export class ProjectSelectorPage implements OnInit {
  
  private clickedStatus = {};
  private loading: any;
  
  constructor(private loadingCtrl: LoadingController, private alertController: AlertController,
    public mobileState: MobileService) {
    }
    
    ngOnInit() {}
    
    public projectGo(project: any) {
      alert(project.name);
      return;
    }
    
    public projectToggle(project: any, isChecked: boolean) {
      this.clickedStatus[project.name] = isChecked;
      return;
    }
    
    public upload() {
      return;
    }
    
    public offlineToggle() {
      if (!this.mobileState.offline) {
        if (Object.keys(this.clickedStatus).length <= 0) {
          setTimeout(async () => {
            (await this.alertController.create({
              header: 'No projects selected',
              subHeader: 'No projects were selected for pre-loading. Select the projects you wish to access while offline and try again.',
              buttons: ['Ok']
            })).present();
          }, 200);
        } else {
          setTimeout(async () => {
            this.loading = await this.loadingCtrl.create({
              message: 'Caching projects for offline use ...'
            });
            await this.loading.present();
            // TODO: perform caching action here
          }, 200);
          // Now we are clear to go offline
          this.mobileState.offlineToggle();
        }
      } else {
        this.mobileState.offlineToggle();
      }
      return;
    }
    
    public testSQLiteImport() {
      
    }
  }
  