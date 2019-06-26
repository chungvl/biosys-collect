import { Component, OnInit } from '@angular/core';
import { GoogleMap, GoogleMaps, GoogleMapsEvent, ILatLng, LatLng, Marker } from '@ionic-native/google-maps';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MobileService } from '../shared/services/mobile.service';
import { Site } from '../biosys-core/interfaces/api.interfaces';
import { isDatasetCensus } from '../shared/utils/functions';

@Component({
  selector: 'app-site-map',
  templateUrl: './site-map.component.html',
  styleUrls: ['./site-map.component.scss'],
})
export class SiteMapComponent implements OnInit {
  private map: GoogleMap;
  public sites: Site[];

  private markerToSite: any;

  constructor(private loadingCtrl: LoadingController,
              private alertController: AlertController,
              private router: Router,
              public mobileState: MobileService) { }

  async ionViewWillEnter() {
    this.loadSites();
  }

  ngOnInit() {
    this.map = GoogleMaps.create('map');
    this.map.setOptions({
      backgroundColor: 'white',
      building: false,
      mapType: 'MAP_TYPE_HYBRID',
      controls: {
        compass: false,
        zoom: false,
        indoorPicker: false,
        mapToolbar: false,
        myLocation: false,
        myLocationButton: false,
      },
      gestures: {
        scroll: true,
        zoom: true,
        tilt: false,
        rotate: false,
      },
      camera: {
        target: new LatLng(-25, 122),
        zoom: 3.5,
      }
    });
    // this.map.setMyLocationEnabled(true);
    // this.map.setMyLocationButtonEnabled(true);
    return;
  }

  public ionicGoBack() {
    this.router.navigateByUrl('form-selector');
  }

  private async loadSites() {
    const spinWait = await this.loadingCtrl.create({
      message: 'Loading Sites ...',
    });
    await spinWait.present();
    this.markerToSite = {};
    const points: ILatLng[] = [];

    this.mobileState.getAllSitesForProjectID(this.mobileState.currentProject.id)
    .subscribe(
      async (stuff) => {
        this.sites = stuff;
        await spinWait.dismiss();
        await this.map.clear();

        for (const site of this.sites) {
          points.push({
            lat: site.centroid['coordinates'][1],
            lng: site.centroid['coordinates'][0],
          });
          this.map.addMarker({
            title: site.code,
            position: {
              lat: site.centroid['coordinates'][1],
              lng: site.centroid['coordinates'][0],
            },
          }).then( (m: Marker) => {
            this.markerToSite[m.getId()] = site;
            m.on(GoogleMapsEvent.INFO_CLICK).subscribe(
              async (pin) => {
                const theSite = this.markerToSite[m.getId()];
                (await this.alertController.create({
                  header: theSite.code + ': ' + theSite.name,
                  message: theSite.description,
                  backdropDismiss: true,
                  buttons: [
                    {
                      text: 'OK',
                      handler: () => { }
                    },
                  ]
                })).present();
                return;
              }
            );
          });
        }
        return;
      },
      async (err) => {
        await spinWait.dismiss();
        return;
      }, () => {
        this.map.moveCamera({
          target: points
        });
      });
  }
}
