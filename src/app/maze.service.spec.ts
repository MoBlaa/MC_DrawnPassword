import { TestBed } from '@angular/core/testing';

import { MazeService } from './maze.service';

describe('MazeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MazeService = TestBed.get(MazeService);
    expect(service).toBeTruthy();
  });
});
