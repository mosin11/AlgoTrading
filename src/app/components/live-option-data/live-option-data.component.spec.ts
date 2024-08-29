import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveOptionDataComponent } from './live-option-data.component';

describe('LiveOptionDataComponent', () => {
  let component: LiveOptionDataComponent;
  let fixture: ComponentFixture<LiveOptionDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveOptionDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveOptionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
