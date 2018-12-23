import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomMazeComponent } from './custom-maze/custom-maze.component';

@NgModule({
  declarations: [
    CustomMazeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CustomMazeComponent
  ]
})
export class CustomMazeModule { }
