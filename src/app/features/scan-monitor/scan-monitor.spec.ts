import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanMonitor } from './scan-monitor';

describe('ScanMonitor', () => {
  let component: ScanMonitor;
  let fixture: ComponentFixture<ScanMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanMonitor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanMonitor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
