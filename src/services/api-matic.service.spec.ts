import { TestBed } from '@angular/core/testing';

import { ApiMaticService } from './api-matic.service';

describe('ApiMaticService', () => {
  let service: ApiMaticService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiMaticService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
