import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { PhaserModule } from 'phaser-component-library';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { AppComponent } from './app.component';
import { MazeComponent } from './maze/maze.component';

@NgModule({
  declarations: [
    AppComponent,
    MazeComponent
  ],
  imports: [
    BrowserModule,
    PhaserModule,
    DeviceDetectorModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
