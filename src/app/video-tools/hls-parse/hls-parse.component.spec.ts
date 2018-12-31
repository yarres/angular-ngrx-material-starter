import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HlsParseComponent } from './hls-parse.component';

describe('HlsParseComponent', () => {
  let component: HlsParseComponent;
  let fixture: ComponentFixture<HlsParseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HlsParseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HlsParseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
