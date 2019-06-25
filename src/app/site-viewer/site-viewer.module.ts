import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SiteViewerPage } from './site-viewer.page';

const routes: Routes = [
  {
    path: '',
    component: SiteViewerPage,
    children: [
      { path: 'list', loadChildren: '../site-list/site-list.module#SiteListComponentModule' },
      { path: 'map', loadChildren: '../site-map/site-map.module#SiteMapComponentModule' }
    ]
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SiteViewerPage]
})
export class SiteViewerPageModule {}
