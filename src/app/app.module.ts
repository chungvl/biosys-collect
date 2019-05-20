import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StorageService } from './shared/services/storage.service';
import { IonicStorageModule } from '@ionic/storage';
import { UploadService } from './shared/services/upload.service';
import { APIService } from './biosys-core/services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { MobileService } from './shared/services/mobile.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    StorageService,
    UploadService,
    APIService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    MobileService,
    FilePath,
    FileTransfer
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
