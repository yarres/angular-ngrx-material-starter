import { TestBed } from '@angular/core/testing';

import { TokenManagerService } from './token-manager.service';

describe('TokenManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TokenManagerService = TestBed.get(TokenManagerService);
    expect(service).toBeTruthy();
  });
});
