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
    this.alertMessage.nativeElement.innerHTML = `Congrats! You took "${this.getCurrentTime()}" (mm:ss)`;
  }

  public getCurrentTime(): string {
    const sinceLast = this.gameService.getStartTime();
    if (sinceLast < 0) {
      this.time = '00:00';
    } else {
      const now = Date.now();
      this.time = this.msToString(now - sinceLast);
    }
    return this.time;
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
    if (screenfull) {
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
  }

  public stopGame() {
    this.exitFullscreen();
    this.gameService.stop();
    this.running = false;
  }

  public toggleGame(): void {
    if (this.running) {
      this.stopGame();
    } else {
      this.startGame();
    }
  }
}
