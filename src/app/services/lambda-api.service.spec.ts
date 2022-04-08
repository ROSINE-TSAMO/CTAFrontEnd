import { TestBed } from '@angular/core/testing';

import { LambdaApiService } from './lambda-api.service';

describe('LambdaApiService', () => {
  let service: LambdaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LambdaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
