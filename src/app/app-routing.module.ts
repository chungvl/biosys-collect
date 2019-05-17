import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { SqliteDbCopy } from '@ionic-native/sqlite-db-copy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { File } from '@ionic-native/file/ngx';

// const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: 'login', component: LoginPage},
  // { path: 'project-selector', component: ProjectSelectorPage},
  // TODO populate routes for other components
// ];
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',            loadChildren: './login/login.module#LoginPageModule'},
  { path: 'project-selector', loadChildren: './project-selector/project-selector.module#ProjectSelectorPageModule'},
  { path: 'sqlite-test', loadChildren: './sqlite-test/sqlite-test.module#SqliteTestPageModule' },
  // TODO populate routes for other components
  { path: 'form-selector',    loadChildren: './form-selector/form-selector.module#FormSelectorPageModule' },
  { path: 'form-viewer',      loadChildren: './form-viewer/form-viewer.module#FormViewerPageModule' },
  { path: 'upload', loadChildren: './upload/upload.module#UploadPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
  providers: [
    SQLite,
    SqliteDbCopy,
    Geolocation,
    File
  ]
})
export class AppRoutingModule { }
