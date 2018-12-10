import { Component } from '@angular/core';
import { SceneService } from './scene.service';
import { environment } from 'src/environments/environment';
import { MazeService } from './maze.service';

// TODO: Quadratic everytime and centering

@Component({
  selector: 'app-maze',
  template: `<phaser-component [gameConfig]="gameConfig" (gameReady)="onGameReady($event)" [Phaser]="phaser"></phaser-component>`,
  styleUrls: ['./maze.component.scss'],
  providers: [SceneService]
})
export class MazeComponent {
  public game: Phaser.Game;

  public readonly gameConfig: GameConfig = {
    title: environment.title,
    version: environment.version,
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerWidth,
    backgroundColor: '#ffffff', // White background
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { z: 200, y: 0, x: 0 }
      }
    }
  };

  public readonly phaser = Phaser;

  public constructor(
    public sceneService: SceneService,
    public mazeService: MazeService
    ) { }

  public onGameReady(game: Phaser.Game): void {
    this.game = game;
    this.game.scene.add('Scene', this.sceneService, true);
  }
}
