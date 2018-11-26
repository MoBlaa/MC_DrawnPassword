import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawnPasswordComponent } from './drawn-password.component';

describe('DrawnPasswordComponent', () => {
  let component: DrawnPasswordComponent;
  let fixture: ComponentFixture<DrawnPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawnPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawnPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
