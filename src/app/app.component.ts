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

  time: string;
  running = false;

  timeUpdater: number;

  @ViewChild('start') btnStart: ElementRef;
  @ViewChild('stop') btnStop: ElementRef;

  alerting = false;
  @ViewChild('message') alertMessage: ElementRef;

  constructor(
    private gameService: GameService
  ) {
    this.finished = this.finished.bind(this);
    this.gameService.finished = this.finished;
  }

  public finished(): void {
    this.stopGame();
    this.alerting = true;
    // Show the message
    this.alertMessage.nativeElement.innerHTML = `Congrats! You took "${this.time}" (mm:ss)`;
    this.time = this.msToString(0);
  }

  public getCurrentTime(): number {
    const sinceLast = this.gameService.getStartTime();
    if (sinceLast < 0) {
      return 0;
    } else {
      const now = Date.now();
      return now - sinceLast;
    }
  }

  private msToString(ms: number): string {
    const diff = ms / 1000;

    // Calc seconds and Minutes
    const diffSeconds = Math.floor(diff % 60);
    const diffMinutes = Math.floor(diff / 60);

    let sDiff = '';
    if (diffMinutes < 10) {
      sDiff += '0';
    }
    sDiff += `${diffMinutes}:`;
    if (diffSeconds < 10) {
      sDiff += '0';
    }
    sDiff += `${diffSeconds}`;
    return sDiff;
  }

  private openFullscreen() {
    if (screenfull && !screenfull.isFullscreen) {
      screenfull.request(document.getElementById('game-div'));

      window.screen.orientation.lock('portrait')
        .then(() => console.log('Successfully locked screen orientation'))
        .catch((reason) => console.error('Failed to lock screen orientation: ' + reason));

      screenfull.onchange(() => {
        if (screenfull && !screenfull.isFullscreen) {
          this.gameService.stop();
          this.running = false;
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
    // Fullscreen and start game
    this.openFullscreen();
    this.gameService.start();
    this.running = true;
    this.alerting = false;

    this.timeUpdater = window.setInterval(() => {
      this.time = this.msToString(this.getCurrentTime());
    }, 1000);
  }

  public stopGame() {
    this.gameService.stop();
    this.running = false;

    window.clearInterval(this.timeUpdater);
  }

  public toggleGame(): void {
    if (this.running) {
      this.stopGame();
    } else {
      this.startGame();
    }
  }
}
