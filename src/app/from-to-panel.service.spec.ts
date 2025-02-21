import { TestBed } from '@angular/core/testing';

import { FromToPanelService } from './from-to-panel.service';

describe('FromToPanelService', () => {
  let service: FromToPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FromToPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
