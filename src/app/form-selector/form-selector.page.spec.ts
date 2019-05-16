import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSelectorPage } from './form-selector.page';

describe('FormSelectorPage', () => {
  let component: FormSelectorPage;
  let fixture: ComponentFixture<FormSelectorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormSelectorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
