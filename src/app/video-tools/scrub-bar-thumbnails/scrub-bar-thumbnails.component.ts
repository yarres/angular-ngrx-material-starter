import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';


// Depends on videogular API:
//  API.totalTime
//  API.mediaElement => le media que l'on target pour obtenir sa duration

@Component({
  selector: 'anms-scrub-bar-thumbnails',
  template: `
      <div #thumbWrapper class="vg-thumbnails" ng-show="thumbnails" ng-style="thumbnailContainer">
          <div #thumb class="image-thumbnail" ng-style="thumbnails"></div>
      </div>
      <div #background class="background"></div>
  `,
  styleUrls: ['./scrub-bar-thumbnails.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrubBarThumbnailsComponent implements OnInit, OnDestroy {
  @ViewChild('background') background;
  @ViewChild('thumbWrapper') thumbWrapper;
  @ViewChild('thumb') thumb;

  thumbnailsWidth = 0;
  thumbWidth = 0;
  vgThumbnails: any;
  slider = this.background;
  isStrip = (typeof this.vgThumbnails === 'string');
  thumbnails: object;
  thumbnailContainer = {};
  thLoader: any;
  @Input() duration: any;
  @Input() totalTime: any;

  constructor() {
  }

  ngOnInit() {
    this.setThumbLoader();
  }

  getOffset(event) {
    let el = event.target,
      x = 0;

    while (el && !isNaN(el.offsetLeft)) {
      x += el.offsetLeft - el.scrollLeft;
      el = el.offsetParent;
    }

    return event.clientX - x;
  };

  onLoadThumbnails(event) {
    this.thumbnailsWidth = event.currentTarget.naturalWidth;
    this.thumbWidth = this.thumbnailsWidth / 100;
  };

  onLoadThumbnail(event) {
    this.thumbWidth = event.currentTarget.naturalWidth;
  };

  updateThumbnails(second) {
    const percentage = Math.round(second * 100 / (this.totalTime / 1000));
    const thPos = (this.slider.scrollWidth * percentage / 100) - (this.thumbWidth / 2);

    if (this.isStrip) {
      const bgPos = Math.round(this.thumbnailsWidth * percentage / 100);

      this.thumbnailContainer = {
        'width': this.thumbWidth + 'px',
        'left': thPos + 'px'
      };

      this.thumbnails = {
        'background-image': 'url("' + this.vgThumbnails + '")',
        'background-position': -bgPos + 'px 0px'
      };
    } else {
      const secondsByPixel = this.totalTime / this.slider.scrollWidth / 1000;
      const lapse = {
        start: Math.floor(second - (secondsByPixel / 2)),
        end: Math.ceil(second)
      };

      if (lapse.start < 0) lapse.start = 0;
      if (lapse.end > this.totalTime) lapse.end = this.totalTime;

      this.thumbnailContainer = {
        'left': thPos + 'px'
      };

      this.thumbnails = {
        'background-image': 'none'
      };

      if (this.vgThumbnails) {
        for (let i = 0, l = this.vgThumbnails.length; i < l; i++) {
          const th = this.vgThumbnails[i] as any;

          if (th.timeLapse.end >= 0) {
            if (lapse.start >= th.timeLapse.start && (lapse.end <= th.timeLapse.end || lapse.end <= th.timeLapse.start)) {
              this.thumbnails = {
                'background-image': 'url("' + th.params.thumbnail + '")'
              };
              break;
            }
          } else {
            if (th.timeLapse.start >= lapse.start && th.timeLapse.start <= lapse.end) {
              this.thumbnails = {
                'background-image': 'url("' + th.params.thumbnail + '")'
              };
              break;
            }
          }
        }
      }
    }
  };

  onMouseMove($event) {
    const second = Math.round($event.offsetX * this.duration / this.slider.scrollWidth);

    this.updateThumbnails(second);
  };

  onTouchMove($event) {
    const touches = $event.touches;
    const touchX = this.getOffset(touches[0]);
    const second = Math.round(touchX * this.duration / this.slider.scrollWidth);

    this.updateThumbnails(second);
  };

  @HostListener('mouseleave')
  onMouseLeave() {
    this.thumbnails = {};
  };

  ngOnDestroy() {
    // unbind the host listeners for all events
  };

  setThumbLoader() {
    if (this.isStrip) {
      this.thLoader = new Image();
      this.thLoader.onload = this.onLoadThumbnails.bind(this);
      this.thLoader.src = this.vgThumbnails;
    } else {
      this.thLoader = new Image();
      this.thLoader.onload = this.onLoadThumbnail.bind(this);
      this.thLoader.src = this.vgThumbnails[0].params.thumbnail;
    }

  }

}



