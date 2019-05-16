import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormViewerPage } from './form-viewer.page';

describe('FormViewerPage', () => {
  let component: FormViewerPage;
  let fixture: ComponentFixture<FormViewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormViewerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
