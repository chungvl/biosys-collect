import { Component, OnInit } from '@angular/core';
import { MobileService } from '../shared/services/mobile.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import * as Base64 from 'base-64';


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
              private transfer: FileTransfer, private file: File,
              private sqliteDbCopy: SqliteDbCopy, private sqlite: SQLite) {
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

          await this.loading.dismiss();

          // now iterate through and find mbtiles:
          for (const proj of this.mobileState.projects) {
            if (this.clickedStatus[proj.code]) {

              this.loading = await this.loadingCtrl.create({
                message: 'Loading MBtile for ' + proj.name,
                duration: 2000
              });

              if (proj.attributes != null) {
                const url = proj.attributes.mbtile;
                console.log('mbtile_url', url);
                this.fileTransfer.download(url, this.file.documentsDirectory + '/mapdata/' + proj.code + '.mbtile').then((entry) => {
                  console.log('download complete: ' + entry.toURL());
                  // copy mbtile file to platform specific location for extraction
                  this.sqliteDbCopy.copyDbFromStorage(proj.code + '.mbtiles', 0,  entry.toURL(), true).then((success) => {
                    console.log('DB copied');
                    this.extractDataBase(proj.code);
                  }).catch(e => console.log(e));
                }, (error) => {
                  console.log('download error ' + error);
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

  private extractDataBase(dbName: string) {
    const sqlpromise = this.sqlite.create({ name: dbName + '.mbtiles', location: 'default', createFromLocation: 0 });

    sqlpromise.then((db: SQLiteObject) => {
      const mapFileLocation = this.file.documentsDirectory + '/mapdata/' + dbName;
      this.file.createDir(this.file.documentsDirectory, 'mapdata', true).then(() => {
        this.file.checkDir(this.file.documentsDirectory + '/mapdata/', dbName).then((exists) => {
          if (exists == true) {
            console.log('Tile data already copied - loading map');
            // Ready to load map
          }
        }).catch((e) => {
          console.log('Tile data required to get copied...' + e);
          this.file.createDir(this.file.documentsDirectory + 'mapdata/', dbName, true).then(() => {
            db.executeSql('SELECT count(*) AS dbCount FROM tiles', [])
            .then((resultSet) => {
              const dbCount = resultSet.rows.item(0).dbCount;
              const offsetLimit = Math.ceil(dbCount / 1000);
              this.presentLoading({
                message: 'Loading map data...'
              });
              for(let i = 0; i <= offsetLimit; i++) {
                console.log('extractTilesToFileSystem ', i);
                this.extractTilesToFileSystem(db, i * 1000, dbCount, 1000, mapFileLocation);
              }
            });
          });
        });
      });
    });
  }

  setLoadingText(text:string) {
    const elem = document.querySelector(
      "div.loading-wrapper div.loading-content");
      if(elem) elem.innerHTML = text;
  }

  private extractTilesToFileSystem(db: SQLiteObject, cursor: number, cursorSize: number, limitSize: number, mapFileLocation: string) {
    db.executeSql('SELECT tile_row AS row, tile_column AS column, zoom_level AS zoom, hex(tile_data) AS data FROM tiles ORDER BY zoom_level, tile_row, tile_column LIMIT ' + limitSize +' OFFSET ' + cursor, [])
    .then((resultSet) => {
      console.log('__Current Cursor ' + cursor + ' of '+ cursorSize);
      const progress =  (cursor / cursorSize) * 100;
      console.log('__Progress: ' + progress + ' % ');
      this.setLoadingText(parseInt(progress.toString()) + ' % done');
      const db_data = resultSet.rows;
      for(let i = 0; i <= db_data.length; i++){
        const x = db_data.item(i).column;
        const y = db_data.item(i).row;
        const zoom = db_data.item(i).zoom;
        const newY = (1 << zoom) - y - 1;
        const blob = db_data.item(i).data;
        let bString = '';
        for (let i = 0; i < blob.length; i += 2) {
          bString += String.fromCharCode( parseInt( blob.substr( i, 2), 16));
        }
        const imageData = Base64.encode(bString);
        const base64ImageData = 'data:image/png;base64,' + imageData;
        const imageBlob = this.b64toBlob(imageData, 'image/png', 512)

        // TODO: iOS specific folder, probably need changing for Android
        this.file.writeFile(mapFileLocation, zoom + '-' + x + '-' + newY + '.png', imageBlob, {replace: true})
        .catch((err) => {
          console.error(err);
        })
      }
    })
    .finally(() => {
      if (cursor >= cursorSize) {
        console.log('Loading Map');
        if (this.loading) {
          this.loading.dismiss();
        }
        console.log('Map extracted successfully');
        // Ready to load map
      }
    })
    .catch(e => console.log(e));
  }

  private b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }
}
