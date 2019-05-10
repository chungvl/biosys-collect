import { Component, OnInit, Injectable, ViewChild, ElementRef, NgZone } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent
} from '@ionic-native/google-maps';
import * as Base64 from 'base-64';
import { File } from '@ionic-native/file/ngx';
import { LoadingController } from '@ionic/angular';

declare var google: any;
@Component({
  selector: 'app-sqlite-test',
  templateUrl: './sqlite-test.page.html',
  styleUrls: ['./sqlite-test.page.scss'],
})

@Injectable()
export class SqliteTestPage implements OnInit {

  @ViewChild('Map') mapElement: ElementRef;
  map: GoogleMap;
  mapOptions: any;
  location = {lat: null, lng: null};
  markerOptions: any = {position: null, map: null, title: null};
  marker: any;
  apiKey: any = 'AIzaSyBAL66QBq-RH9pStWPUMyTdm9t05QtUmXg';
  private loading: any;
  private mapFileLocation;
  layers = [];

  constructor(private sqliteDbCopy: SqliteDbCopy,
    private sqlite: SQLite, public platform: Platform,
    public geolocation: Geolocation,
    private file: File,
    private loadingCtrl: LoadingController) {
      /*load google map script dynamically */
      // const script = document.createElement('script');
      // script.id = 'googleMap';
      // if (this.apiKey) {
      //   script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey;
      // } else {
      //   script.src = 'https://maps.googleapis.com/maps/api/js?key=';
      // }
      // document.head.appendChild(script);
      // /*Get Current location*/
      // // this.geolocation.getCurrentPosition().then((position) =>  {
      // this.location.lat = -31.953512; // position.coords.latitude;
      // this.location.lng = 115.857048;  // position.coords.longitude;
      // // });
      // /*Map options*/
      this.mapOptions = {
        center: this.location,
        zoom: 5,
        mapTypeControl: false
      };

      // setTimeout(() => {
      //   this.loadMap();
      // //   this.map = GoogleMaps.create(this.mapElement.nativeElement, this.mapOptions);

      // //   /*Marker Options*/
      // //   // console.log('Overlay');
      // //   // [
      // //   //   'https://stamen-tiles.a.ssl.fastly.net/toner/{zoom}/{x}/{y}.png',
      // //   //   'https://stamen-tiles.a.ssl.fastly.net/watercolor/{zoom}/{x}/{y}.jpg'
      // //   // ].forEach((layerUrl: string, idx: number) => {

      // //   const layer = this.map.addTileOverlay({
      // //     // zIndex: idx,
      // //     getTile: (x: number, y: number, zoom: number) => {
      // //       return `http://tile.stamen.com/watercolor/${zoom}/${x}/${y}.jpg`;
      // //     }
      // //   });
      // //   this.layers.push(layer);
      // //   // });
      // //   // this.markerOptions.position = this.location;
      // //   // this.markerOptions.map = this.map;
      // //   // this.markerOptions.title = 'My Location';
      // //   // this.marker = new google.maps.Marker(this.markerOptions);
      // }, 3000);
    }

    private async presentLoading(config?: any): Promise<any> {
      this.loading = await this.loadingCtrl.create(config);
      return await this.loading.present();
    }

    loadMap(db: SQLiteObject) {
      this.map = GoogleMaps.create(this.mapElement.nativeElement, this.mapOptions);
      const layer = this.map.addTileOverlay({
        getTile: (x: number, y: number, zoom: number) => {
          return this.mapFileLocation + '/' + zoom + '-' + x + '-' + y + '.png'
        }
      });
      this.layers.push(layer);
      this.map.animateCamera({
        target: {lat: -31.95224, lng: 115.8614},
        zoom: 5,
      });
    }

    extractTilesToFileSystem(db: SQLiteObject, cursor: number, cursorSize: number, limitSize: number) {
      db.executeSql('SELECT tile_row AS row, tile_column AS column, zoom_level AS zoom, hex(tile_data) AS data FROM tiles ORDER BY zoom_level, tile_row, tile_column LIMIT ' + limitSize +' OFFSET ' + cursor, [])
      .then((resultSet) => {
        console.log('__Current Cursor ' + cursor + ' of '+ cursorSize);
        const progress =  (cursor / cursorSize) * 100;
        console.log('__Progress: ' + progress + ' % ');
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

          //  iOS specific folder, probably need changing for Android
          this.file.writeFile(this.mapFileLocation, zoom + '-' + x + '-' + newY + '.png', imageBlob, {replace: true})
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
          this.loadMap(db);
        }
      })
      .catch(e => console.log(e));
    }

    b64toBlob(b64Data, contentType, sliceSize) {
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

    ngOnInit() {

      this.platform.ready().then(() => {
        console.log('Platform ready');
        this.sqliteDbCopy.copyDbFromStorage('countries-raster.mbtiles', 0,  './www/countries-raster.mbtiles', true).then((success) => {
          console.log('DB copied');
          this.updateTiles();
        }).catch(e => console.log(e));

      });
    }

    updateTiles() {
      const sqlpromise = this.sqlite.create({ name: 'countries-raster.mbtiles', location: 'default', createFromLocation: 0 });
      console.log('promise evalusetes to ' + String(sqlpromise));

      sqlpromise.then((db: SQLiteObject) => {
        this.mapFileLocation = this.file.documentsDirectory + '/mapdata'
        this.file.createDir(this.file.documentsDirectory, 'mapdata', true).then(() => {
          db.executeSql('SELECT count(*) AS dbCount FROM tiles', [])
          .then((resultSet) => {
            const dbCount = resultSet.rows.item(0).dbCount;
            const offsetLimit = Math.ceil(dbCount / 5000);
            this.presentLoading({
              message: 'Loading map data...'
            });
            for(let i = 0; i <= offsetLimit; i++) {
              console.log('extractTilesToFileSystem ', i);
              this.extractTilesToFileSystem(db, i * 5000, dbCount, 5000);
            }
          });
        })
      });
    }

  }
