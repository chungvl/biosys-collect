import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqliteTestPage } from './sqlite-test.page';

describe('SqliteTestPage', () => {
  let component: SqliteTestPage;
  let fixture: ComponentFixture<SqliteTestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqliteTestPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqliteTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
