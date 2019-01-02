import { Injectable } from '@angular/core';
import { CookieService } from './cookie.service';

export interface GameState {
  highscore: number;
}

export const DEFAULT_GAME_STATE: GameState = {
  highscore: 0
};

export const GAMESTATE_ID = 'MAZE_GAME_STATE';
export const GAMESTATE_EXPIRE_DAYS = 5 * 365; // Gamestate is valid for 5 Years

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private latest: GameState;

  constructor(
    private cookieService: CookieService
  ) {
    const cookie = cookieService.getCookie(GAMESTATE_ID);
    if (cookie) {
      this.latest = JSON.parse(cookie);
    }
    if (!this.latest) {
      this.latest = DEFAULT_GAME_STATE;
    }
  }

  public saveGamestate(gamestate: GameState): void {
    // Check gamestate
    if (gamestate.highscore > this.latest.highscore) {
      console.error(`Tried to set Gamestate to invalid: ${JSON.stringify(gamestate)} @ latest '${JSON.stringify(this.latest)}'`);
      return;
    }
    this.latest = gamestate;

    // Set gamestate and save
    const gs = JSON.stringify(this.latest);
    this.cookieService.setCookie(GAMESTATE_ID, gs, GAMESTATE_EXPIRE_DAYS);
  }

  public loadGamestate(): GameState {
    return this.latest;
  }
}
