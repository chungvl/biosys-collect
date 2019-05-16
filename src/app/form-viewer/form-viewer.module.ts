import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatMenuModule,
  MatSelectModule,
  MatToolbarModule
} from '@angular/material';
import { IonicModule } from '@ionic/angular';

import { FormViewerPage } from './form-viewer.page';
import {
  Bootstrap3FrameworkModule,
  Bootstrap4FrameworkModule,
  MaterialDesignFrameworkModule,
  NoFrameworkModule
} from 'angular6-json-schema-form';

const routes: Routes = [
  {
    path: '',
    component: FormViewerPage
  }
];

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule, MatCardModule, MatCheckboxModule,
    MatIconModule, MatMenuModule, MatSelectModule, MatToolbarModule,
    MaterialDesignFrameworkModule,
    Bootstrap4FrameworkModule,
    Bootstrap3FrameworkModule,
    NoFrameworkModule,

    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [FormViewerPage]
})
export class FormViewerPageModule {}

// FIXME: remove unused frameworks