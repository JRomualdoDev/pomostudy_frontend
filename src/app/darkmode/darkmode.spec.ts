import { TestBed } from '@angular/core/testing';

import { Darkmode } from './darkmode';

describe('Darkmode', () => {
  let service: Darkmode;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Darkmode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
