import { TestBed } from '@angular/core/testing';

import { MazeGeneratorService } from './mazegenerator.service';

describe('MazeGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MazeGeneratorService = TestBed.get(MazeGeneratorService);
    expect(service).toBeTruthy();
  });
});
