import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrubBarThumbnailsComponent } from './scrub-bar-thumbnails.component';

describe('ScrubBarThumbnailsComponent', () => {
  let component: ScrubBarThumbnailsComponent;
  let fixture: ComponentFixture<ScrubBarThumbnailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrubBarThumbnailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrubBarThumbnailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
