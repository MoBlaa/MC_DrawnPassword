import { TestBed } from '@angular/core/testing';

import { GameService } from './game.service';
import { MazeGeneratorService } from './mazegenerator.service';
import { Brick } from './brick';

fdescribe('GameService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MazeGeneratorService
    ]
  }));

  it('should be created', () => {
    const service: GameService = TestBed.get(GameService);
    expect(service).toBeTruthy();
    const genService: MazeGeneratorService = TestBed.get(MazeGeneratorService);
    expect(genService).toBeTruthy();
  });

  it('#start should initialize maze', () => {
    const service: GameService = TestBed.get(GameService);
    service.start();
    expect(service.getWalls()).toBeTruthy();
    expect(service.getWalls().length).toBeGreaterThan(0);
  });

  it('#reset should clear the maze', () => {
    const service: GameService = TestBed.get(GameService);
    service.start();
    service.stop();
    expect(service.getWalls().length).toEqual(0);
  });

  fit('#start after reset should generate a new maze', () => {
    const service: GameService = TestBed.get(GameService);
    service.start();
    const firstWalls = new Set<Brick>(service.getWalls());
    service.stop();
    service.start();
    const secondWalls = new Set<Brick>(service.getWalls());
    expect(service.getWalls().length).toBeLessThanOrEqual((service.mazeSize - 1) * (service.mazeSize - 1));
    expect(service.getWalls().length).toBeGreaterThan(0);
    // Assert that no equal objects are used (Javascript sets compare by object/reference equality)
    firstWalls.forEach(wall => {
      expect(secondWalls.has(wall)).toBeFalsy();
    });
  });
});
