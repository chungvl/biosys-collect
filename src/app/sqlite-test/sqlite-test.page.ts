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

  layers = [];

  constructor(private sqliteDbCopy: SqliteDbCopy, private sqlite: SQLite, public platform: Platform,
    public geolocation: Geolocation) {
      /*load google map script dynamically */
      const script = document.createElement('script');
      script.id = 'googleMap';
      if (this.apiKey) {
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey;
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?key=';
      }
      document.head.appendChild(script);
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

    loadMap(db: SQLiteObject) {
      // setTimeout(() => {
      this.map = GoogleMaps.create(this.mapElement.nativeElement, this.mapOptions);
      const layer = this.map.addTileOverlay({
        // zIndex: idx,
        getTile: (x: number, y: number, zoom: number) => {
          const tileData = this.fetchTilesFromDB(db, x, y, zoom);
          console.log('TileData ' + tileData);
          return this.fetchTilesFromDB(db, x, y, zoom);
          // return `http://tile.stamen.com/watercolor/${zoom}/${x}/${y}.jpg`;
        }
      });
      this.layers.push(layer);
      // }, 3000);
    }


    fetchTilesFromDB(db: SQLiteObject, x: number, y: number, zoom: number): Promise<string> {
      const newY = (1 << zoom) - y - 1;
      return db.executeSql('SELECT hex(tile_data) AS data FROM tiles WHERE\
        tile_row = ' + newY + ' and tile_column = ' + x + ' and zoom_level = ' + zoom + '', [])
        .then((resultSet) => {
          const blob = resultSet.rows.item(0).data;
          let bString = '';
          for (let i = 0; i < blob.length; i += 2) {
            bString += String.fromCharCode( parseInt( blob.substr( i, 2), 16));
          }
          const base64 = Base64.encode(bString);
          console.log('base64 ' + base64);
          return base64;
        })
        .catch(e => console.log(e));
    }

    ngOnInit() {
      //   this.map = GoogleMaps.create(this.mapElement.nativeElement, this.mapOptions);

      //   /*Marker Options*/
      //   // console.log('Overlay');
      //   // [
      //   //   'https://stamen-tiles.a.ssl.fastly.net/toner/{zoom}/{x}/{y}.png',
      //   //   'https://stamen-tiles.a.ssl.fastly.net/watercolor/{zoom}/{x}/{y}.jpg'
      //   // ].forEach((layerUrl: string, idx: number) => {

      //   const layer = this.map.addTileOverlay({
      //     // zIndex: idx,
      //     getTile: (x: number, y: number, zoom: number) => {
      //       return `http://tile.stamen.com/watercolor/${zoom}/${x}/${y}.jpg`;
      //     }
      //   });
      //   this.layers.push(layer);
      //   // });
      //   // this.markerOptions.position = this.location;
      //   // this.markerOptions.map = this.map;
      //   // this.markerOptions.title = 'My Location';
      //   // this.marker = new google.maps.Marker(this.markerOptions);

      this.platform.ready().then(() => {
        console.log('Platform ready');
        this.sqliteDbCopy.copyDbFromStorage('countries-raster.mbtiles', 0,  './www/countries-raster.mbtiles', true).then((success) => {
          console.log('DB copied');
          this.updateTiles();
        }).catch(e => console.log(e));

      });
      // console.log('onInit');
    }

    updateTiles() {
      const sqlpromise = this.sqlite.create({ name: 'countries-raster.mbtiles', location: 'default', createFromLocation: 0 });
      console.log('promise evalusetes to ' + String(sqlpromise));

      sqlpromise.then((db: SQLiteObject) => {
        // db.executeSql('create table danceMoves(name VARCHAR(32))', [])
        // .then(() => console.log('Execued SQL'))
        // .catch(e => console.log(e));
        this.loadMap(db);
      });
    }
    // ngOnInit() {
    //   this.platform.ready().then(() => {
    //     this.sqliteDbCopy.copyDbFromStorage('countries-raster.mbtiles', 0,  './www/countries-raster.mbtiles', true).then((success) => {
    //       this.copysuccess();
    //     }).catch(e => console.log(e));

    //   });

    // }

    // copysuccess() {
    //   const sqlpromise = this.sqlite.create({ name: 'countries-raster.mbtiles', location: 'default', createFromLocation: 0 });

    //   console.log('promise evalusetes to ' + String(sqlpromise));

    //   sqlpromise.then((db: SQLiteObject) => {
    //     console.log('after promise function');

    //     db.executeSql('create table danceMoves(name VARCHAR(32))', [])
    //     .then(() => console.log('Execued SQL'))
    //     .catch(e => console.log(e));


    //   })
    //   .catch(e => console.log(e));
    // }

    // copyerror(e) {
    //   console.log('Error Code = ' + JSON.stringify(e));
    // }

  }
