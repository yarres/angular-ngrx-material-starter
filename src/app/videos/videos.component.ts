import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';


import { VgAPI } from 'videogular2/core';
import { Options } from 'ng5-slider';

@Component({
  selector: 'anms-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideosComponent implements OnInit {
  api: VgAPI;
  hls: any;
  vgMedia: any;


  // Video stream
  duration: number;
  tcinSec: number;
  tcoutSec: number;
  tcin: string;
  tcout: string;
  // Slider
  minValue = 0;
  maxValue = 5;
  options: Options = {
    floor: 0,
    // ceil: 600,
    // translate: this.secondsToMinutesAndSeconds(value),
    //  step: 2,
    tickStep: 10,
    /* showTicks: true,*/
    minRange: 5,
    pushRange: true,
    noSwitching: true,
    draggableRange: true
  };

  constructor(api: VgAPI) {
    this.api = api;

  }


  ngOnInit() {
    console.log('VGAPI ===', this.api);
    console.log('HLS ===', this.hls);
    console.log('VGMEDIA ===', this.vgMedia);
    console.log('VG hls ===', this.api);
  }

  @HostListener('click', ['$event'])
  onClick(ev) {
    console.log('CLICK event', ev);
  }


  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    console.log('EVENT =', event.key);
    console.log('EVENT =', event);
    console.log('API =', this.api);
    console.log('API 2 =', this.api.medias);
    const currentTime = this.api.currentTime;
    const state = this.api.state;

    switch (event.key) {
      case 'ArrowLeft':
        if (state === 'playing') {
          this.api.seekTime(currentTime - Number(2));
        }
        break;
      case '4':
        if (state === 'paused') {
          this.api.seekTime(currentTime - Number(1 / 25));
        }
        break;
      case '6':
        if (state === 'paused') {
          this.api.seekTime(currentTime - Number(1 / 25));
        }
        break;
      case 'k':
        if (this.api.state === 'paused' && this.api.canPlay) {
          this.api.play();
        }
        if (this.api.state === 'playing') {
          this.api.pause();
        }
    }
  }

  // setTci()

  onPlayerReady(api) {
    this.api = api;
    console.log('ON player ready event =', api);
    console.log('TIME of video 1 =', this.api.time);
    console.log('TIME of video 2 =', this.api.getMediaById('myVideo').elem);
    this.api.getMediaById('myVideo').subscriptions.loadedData.subscribe((res) => {
      this.duration = res.target.duration;
      console.log('TARGET ===', res.target);
      this.options.ceil = this.duration;
      this.options = {
        floor: 0,
        ceil: this.duration,
        // translate: this.secondsToMinutesAndSeconds(value),
        //  step: 2,
        tickStep: 10,
        /* showTicks: true,*/
        minRange: 5,
        pushRange: true,
        noSwitching: true,
        draggableRange: true
      };
      console.log('OPTIONS.CEIL', this.options.ceil);
      console.log('duration', this.duration);
      console.log('minValue ', this.minValue);
      console.log('maxValue', this.maxValue);
    });

    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      (med) => {
        console.log('MED', med.time);
        // Set the video to the beginning
        this.api.getDefaultMedia().currentTime = 0;
      }
    );


  }

  private secondsToMinutesAndSeconds(dataSeconds: number): string {
    const minutes = Math.floor(dataSeconds / 60);
    const seconds = dataSeconds % 60;
    return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
  }

  updateValue(val) {
    console.log('VAL', val);
    this.api.getMediaById('myVideo').currentTime = val.value;
    this.tcinSec = val.value;
    this.tcoutSec = val.highValue;
    this.tcin = this.secondsToMinutesAndSeconds(val.value);
    this.tcout = this.secondsToMinutesAndSeconds(val.highValue);
    /* let minutes = Math.floor(val.value / 60);
     let seconds = val.value % 60;*/

    /*    this.tcin = `${minutes}:${seconds}`;
        this.tcout = val.highValue;*/
  }

  seekTcIn(val) {
    console.log('SEEK val', val);
    this.api.seekTime(this.tcinSec);
  }

  seekTcOut(val) {
    console.log('SEEK val', val);
    this.api.seekTime(this.tcoutSec);
  }

  onEnterCuePoint(event) {
    console.log('EVENT cuepoint', event);
  }

}
