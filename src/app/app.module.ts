import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { PhaserModule } from 'phaser-component-library';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { AppComponent } from './app.component';
import { CustomMazeModule } from './custom-maze/custom-maze.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PhaserModule,
    CustomMazeModule,
    DeviceDetectorModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
