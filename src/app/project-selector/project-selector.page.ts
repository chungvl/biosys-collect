import { Component, OnInit } from '@angular/core';
import { MobileService } from '../shared/services/mobile.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';


@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.page.html',
  styleUrls: ['./project-selector.page.scss'],
})
export class ProjectSelectorPage implements OnInit {

  private clickedStatus = {};
  private loading: any;

  constructor(private loadingCtrl: LoadingController, private alertController: AlertController,
              private router: Router, public mobileState: MobileService,
              private transfer: FileTransfer, private file: File) {
  }

  fileTransfer: FileTransferObject = this.transfer.create();

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

  public projectToggle(project: any) {
    this.clickedStatus[project.code] = !this.clickedStatus[project.code];
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

          // projects should be saved to local storage here:
          // this.mobileState.saveProjects();


          // now iterate through and find mbtiles:
          for (const proj of this.mobileState.projects) {
            if (this.clickedStatus[proj.code]) {

              this.loading = await this.loadingCtrl.create({
                message: 'Loading MBtile for ' + proj.name,
                duration: 2000
              });

              if (proj.attributes != null) {
                // TODO this will be the url array with the maltile files
                const urlArray = proj.attributes.mbtile;
                console.log('mbtile_url', urlArray);
                const destinationURL = this.file.documentsDirectory + '/mapdata/'
                let arrayLength = 0;
                urlArray.forEach((url, index, arr) => {
                  // TODO as tiles are stored as ../zoom/y/x.png we need to move this accordingly to the device filesystem - not 100% how
                  this.fileTransfer.download(url, destinationURL).then((entry) => {
                    console.log('download complete: ' + entry.toURL());
                    const progress =  (index / arr.length - 1) * 100;
                    console.log('__Progress: ' + progress + ' % ');
                    this.setLoadingText(parseInt(progress.toString()) + ' % downloaded');
                    arrayLength = arrayLength + 1
                    if (arrayLength == arr.length) {
                      // All files downloaded - load map
                      this.loading.dismiss();
                    }
                  }, (error) => {
                    console.log('download error ' + error);
                  });
                });
              }
              // this.file.resolveNativePath()
              //
              return;
            }
          }
        }, 200);
        // Now we are clear to go offline
        this.mobileState.offlineToggle();
      }
    } else {
      this.mobileState.offlineToggle();
    }
    return;
  }

  setLoadingText(text:string) {
    const elem = document.querySelector(
      "div.loading-wrapper div.loading-content");
      if(elem) elem.innerHTML = text;
  }
}
