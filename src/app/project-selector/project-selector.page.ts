import { Component, OnInit } from '@angular/core';
import { MobileService } from '../shared/services/mobile.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { from } from 'rxjs';


@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.page.html',
  styleUrls: ['./project-selector.page.scss'],
})
export class ProjectSelectorPage implements OnInit {

  private clickedStatus = {};
  private loading: any;

  constructor(private loadingCtrl: LoadingController, private alertController: AlertController,
              private router: Router, public mobileState: MobileService) {
  }

  ngOnInit() {}

  private async presentLoading(config?: any): Promise<any> {
    this.loading = await this.loadingCtrl.create(config);
    return await this.loading.present();
  }

  public async projectGo(project: any) {
    this.mobileState.currentProject = project;
    from (this.presentLoading({
      message: 'Loading forms for this project ...',
      // duration: 500
    })).subscribe( () => {
      this.mobileState.getForms(project).subscribe(
        async (forms) => {
          console.log('forms', forms);
          this.mobileState.setProjectForms(project.id, forms);
          await this.loading.dismiss();
          this.router.navigateByUrl('/form-selector');
        }, (err) => {
        });
    });
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
            message: 'Caching projects for offline use ...',
            duration: 2000
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
}
