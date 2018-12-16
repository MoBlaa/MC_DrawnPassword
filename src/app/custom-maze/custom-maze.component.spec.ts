import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMazeComponent } from './custom-maze.component';

describe('CustomMazeComponent', () => {
  let component: CustomMazeComponent;
  let fixture: ComponentFixture<CustomMazeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomMazeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomMazeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
