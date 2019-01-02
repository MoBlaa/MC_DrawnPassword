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

  private openFullscreen() {
    if (screenfull) {
      screenfull.request(document.getElementById('game-div'));

      window.screen.orientation.lock('portrait')
        .then(() => console.log('Successfully locked screen orientation'))
        .catch((reason) => console.error('Failed to lock screen orientation: ' + reason));

      screenfull.onchange(() => {
        if (screenfull && !screenfull.isFullscreen) {
          this.gameService.stop();
        }
      });
    }
  }

  private exitFullscreen(): void {
    if (screenfull) {
      screenfull.exit();
    }
  }

  public startGame() {
    this.openFullscreen();
    this.gameService.start();
  }

  public stopGame() {
    this.exitFullscreen();
    this.gameService.stop();
  }
}
