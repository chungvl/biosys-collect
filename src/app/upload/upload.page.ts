import { Component, OnInit } from '@angular/core';
import { Environment, GoogleMap, GoogleMapOptions, GoogleMaps, LatLng, Marker, MyLocation } from '@ionic-native/google-maps';
import { AlertController, LoadingController } from '@ionic/angular';
import { Dialogs } from '@ionic-native/dialogs/ngx';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage implements OnInit {
  private map: GoogleMap;
  private markers: Marker[] = [];

  constructor(private loadingCtrl: LoadingController, private alertController: AlertController) { }

  ngOnInit() {
    this.loadMap();
  }

  ionViewDidLoad() {
  }

  loadMap() {
    this.map = GoogleMaps.create('map', {
      'backgroundColor': 'white',
      'building': false,
      'mapType': 'MAP_TYPE_HYBRID',
      'controls': {
        'compass': false,
        'zoom': false,
        'indoorPicker': false,
      },
      'gestures': {
        'scroll': true,
        'zoom': true,
        'tilt': false,
        'rotate': false,
      },
      'camera': {
        target: new LatLng(-25, 132),
        zoom: 4,
        tilt: 0
      },
    });
    this.map.setMyLocationEnabled(true);
    this.map.setMyLocationButtonEnabled(true);
    this.populateMarkers(this.map);
  }

  private populateMarkers(map: GoogleMap) {
    setTimeout( () => {
      this.populateTestData(map);
    }, 1000);
  }

  private populateTestData(map: GoogleMap) {
    for (let i = 0; i < 16; i++) {
      const lat = -32 + Math.random();
      const lng = 115 + Math.random();
      this.markers.push(map.addMarkerSync({
        title: 'Test ' + (i + 1).toString(),
        icon: i % 2 === 0 ? 'blue' : 'red',
        position: {
          lat: lat,
          lng: lng
        }
      }));
    }
  }

  async uploadClicked() {
    const foo = await this.loadingCtrl.create({
      message: 'Uploading data for this project ...',
    });
    await foo.present();
    setTimeout(async () => {
      await foo.dismiss();
      (await this.alertController.create({
        header: 'Upload Complete',
        subHeader: 'Records "uploaded"',
        buttons: ['Ok']
      })).present();
      for (const marker of this.markers) {
        if (marker) {
          marker.remove();
          this.map.addMarkerSync({
            position: marker.getPosition(),
            icon: 'blue',
            title: marker.getTitle()
          });
        }
      }
    }, 4000);
  }
}
