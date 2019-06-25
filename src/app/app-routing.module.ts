import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
  { path: 'form-selector',    loadChildren: './form-selector/form-selector.module#FormSelectorPageModule' },
  { path: 'form-viewer',      loadChildren: './form-viewer/form-viewer.module#FormViewerPageModule' },
  { path: 'site-viewer',      loadChildren: './site-viewer/site-viewer.module#SiteViewerPageModule' },
  { path: 'upload', loadChildren: './upload/upload.module#UploadPageModule' },
  { path: 'site-add', loadChildren: './site-add/site-add.module#SiteAddPageModule' },
  { path: 'record-list', loadChildren: './record-list/record-list.module#RecordListPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload'
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
