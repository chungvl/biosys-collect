import { Component, OnInit } from '@angular/core';
import { MobileService } from '../shared/services/mobile.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { from } from 'rxjs';

@Component({
  selector: 'app-form-selector',
  templateUrl: './form-selector.page.html',
  styleUrls: ['./form-selector.page.scss'],
})
export class FormSelectorPage implements OnInit {
  public forms: any;
  public offline: boolean;

  public indentedForms: any;

  private loading: any;

  constructor(private loadingCtrl: LoadingController,
              private router: Router,
              private mobileService: MobileService) {
    this.forms = mobileService.getProjectForms(mobileService.currentProject.id);
    this.indentedForms = [];
    for (const key of this.forms) {
      this.indentedForms.push({
        form: key,
        indentation: 0
      });
      if (key['children']) {
        for (const childrenKeys of key['children']) {
          this.indentedForms.push({
            form: childrenKeys,
            indentation: 1
          });
        }
      }
    }
  }

  public itemName(form: any) {
    const indent = '    ';
    let rv = '';
    for (let i = 0; i < form.indentation; i++) {
      rv += indent;
    }
    rv += form.form.name;
    console.log('item', rv);
    return rv;
  }

  ngOnInit() {
    this.offline = this.mobileService.offline;
  }

  private async presentLoading(config?: any): Promise<any> {
    this.loading = await this.loadingCtrl.create(config);
    return await this.loading.present();
  }

  public async ionViewWillLeave() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }

  public async formClicked(form: any) {
    from (this.presentLoading({
      message: 'Loading form ...',
    })).subscribe( () => {
      this.mobileService.setViewForm(form);
      this.mobileService.formEditData = null;
      this.router.navigateByUrl('form-viewer');
    });
  }

  public sitesClicked() {
    this.router.navigateByUrl('site-viewer');
    return;
  }

  public ionicGoBack() {
    this.router.navigateByUrl('project-selector');
  }


  public dataViewClicked() {
    this.router.navigateByUrl('record-list');
  }
}
