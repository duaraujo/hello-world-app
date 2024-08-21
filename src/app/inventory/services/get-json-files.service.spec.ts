import { TestBed } from '@angular/core/testing';

import { GetJsonFilesService } from './get-json-files.service';

describe('GetJsonFilesService', () => {
  let service: GetJsonFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetJsonFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
