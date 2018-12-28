import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GameService } from './game.service';
import * as screenfull from 'screenfull';
import { CustomMazeComponent } from './custom-maze/custom-maze/custom-maze.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MazeGame';

  constructor(
    private gameService: GameService
  ) { }

  public openFullscreen() {
    if (screenfull.enabled) {
      screenfull.request(document.getElementById('game-div'));

      window.screen.orientation.lock('portrait')
        .then(() => console.log('Successfully locked screen orientation'))
        .catch((reason) => console.error('Failed to lock screen orientation: ' + reason));

      /*
    screenfull.onchange(() => {
      if (screenfull.isFullscreen) {
        this.pauseGame();
      }
    });
    */
    }
  }

  public startGame() {
    this.gameService.start();
  }

  public stopGame() {
    this.gameService.stop();
  }
}
