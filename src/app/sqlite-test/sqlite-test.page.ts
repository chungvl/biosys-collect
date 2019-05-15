import { Component, OnInit, Injectable, ViewChild, ElementRef, NgZone } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  LatLng,
  Marker,
  MarkerCluster
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
      this.mapOptions = {
        center: this.location,
        zoom: 5,
        mapTypeControl: false
      };
    }

    private async presentLoading(config?: any): Promise<any> {
      this.loading = await this.loadingCtrl.create(config);
      return await this.loading.present();
    }

    setLoadingText(text:string) {
      const elem = document.querySelector(
        "div.loading-wrapper div.loading-content");
        if(elem) elem.innerHTML = text;
      }

      loadMap() {
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
        const markerArray = [];
        for(let i = 0; i <= 100; i++){
          const lat = this.getRandomArbitrary(-30, -33)
          const lon = this.getRandomArbitrary(114, 117)
          markerArray.push({position: {lat: lat, lng: lon}});
        }
        this.addCluster(markerArray);
      }

      addCluster(data) {
        this.map.addMarkerCluster({
          markers: data,
          icons: [
            {
              min: 2,
              max: 5,
              url: "./www/assets/icon/m1.png",
              label: {
                color: "white"
              }
            },
            {
              min: 5,
              max: 10,
              url: "./www/assets/icon/m2.png",
              label: {
                color: "white"
              }
            },
            {
              min: 10,
              max: 20,
              url: "./www/assets/icon/m3.png",
              label: {
                color: "white"
              }
            },
            {
              min: 20,
              max: 50,
              url: "./www/assets/icon/m4.png",
              label: {
                color: "white"
              }
            },
            {
              min: 50,
              max: 10000,
              url: "./www/assets/icon/m5.png",
              label: {
                color: "white"
              }
            }
          ]
        }).then((markerCluster) => {
          markerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {
            let marker: Marker = params[1];
            marker.setTitle(marker.get("name"));
            marker.setSnippet(marker.get("address"));
            marker.showInfoWindow();
          });
        }).catch((error) => {
          console.log('Error with cluster' + error);
        });
      }

      // Just for testing Marker performance
      getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
      }
      getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      /// END

      ngOnInit() {

        this.platform.ready().then(() => {
          console.log('Platform ready');
          // Define the name of the mbtiles database file that needs to get copied over
          const database_name = 'greatsandydesert'; // greatsandydesert || countries-raster
          this.sqliteDbCopy.copyDbFromStorage(database_name + '.mbtiles', 0,  './www/' + database_name + '.mbtiles', true).then((success) => {
            console.log('DB copied');
            this.fetchTiles(database_name);
          }).catch(e => console.log(e));

        });
      }

      fetchTiles(dbName: string) {
        const sqlpromise = this.sqlite.create({ name: dbName + '.mbtiles', location: 'default', createFromLocation: 0 });
        console.log('promise evalusetes to ' + String(sqlpromise));

        sqlpromise.then((db: SQLiteObject) => {
          this.mapFileLocation = this.file.documentsDirectory + '/mapdata/' + dbName;
          this.file.createDir(this.file.documentsDirectory, 'mapdata', true).then(() => {
            console.log('createDir: ');
            this.file.checkDir(this.file.documentsDirectory + '/mapdata/', dbName).then((exists) => {
              if (exists == true) {
                console.log('Tile data already copied - loading map');
                this.loadMap();
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
                    this.extractTilesToFileSystem(db, i * 1000, dbCount, 1000);
                  }
                });
              });
            });
          });
        });
      }

      extractTilesToFileSystem(db: SQLiteObject, cursor: number, cursorSize: number, limitSize: number) {
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
            this.loadMap();
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

    }
