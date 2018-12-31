import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';

import { VgAPI } from 'videogular2/core';
import { Options } from 'ng5-slider';
import { ApiService } from '../api/api.service';
import { fromEvent, Observable } from 'rxjs';
import { keys, toPairs, forIn } from 'lodash';
import moment from 'moment';


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
  vgHls: any;

  thumb: string;
  test: string;
  currentChannel: string;
  currentHlsStream: string;
  hlsBitrates: any;
  currentThumbnail$: Observable<string>;

  thumbnails: Array<any>;

  // Video stream
  startTimestamp: number;
  endTimestamp: number;
  startTime: string;
  endTime: string;
  totalTime: any;
  duration: number;
  tcinSec: number;
  tcoutSec: number;
  tcin: string;
  tcout: string;
  // Slider
  minValue = 0;
  maxValue = 35;
  options: Options = {
    // floor: 0,
    // ceil: 600,
   
    //  step: 2,
   // tickStep: 10,
    /* showTicks: true,*/
    minRange: 5,
    pushRange: true,
    noSwitching: true,
    draggableRange: true
  };

  constructor(api: VgAPI, private internalApi: ApiService) {
    this.api = api;
  }

  createDateRange(): Date[] {
    const dates: Date[] = [];
    for (let i = 1; i <= 31; i++) {
      dates.push(new Date(2018, 5, i));
    }
    return dates;
  }

  getChannels() {
    console.log('IN get channels')
    this.internalApi.getChannels().subscribe((res) => {
      const channel: any = res[0].encodingInstances[0];
      console.log('Channels', channel);
      this.currentChannel = channel.alternativeIdentifier;
      this.getPlaylist(channel);
    });
  }

  getPlaylist(channel: any) {
    this.currentHlsStream = this.internalApi.getPlaylist(channel);
    console.log('Current HLS STREAm', this.currentHlsStream);
  }

  ngOnInit() {
    console.log('VGAPI ===', this.api);
    console.log('HLS ===', this.hls);
    console.log('VGMEDIA ===', this.vgMedia);
    console.log('VG hls ===', this.api);

    this.getChannels();
    /*   this.getCurrentThumbnail().subscribe((res) => {
         console.log('RES OF THUMB in INIT', res);
       });*/

    /* this.getCurrentThumbnail().subscribe((res) => {
       console.log('Thumb', res);
     });*/
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

  // Current time and end time on the player and in the timeline should be the programdatetime of the stream and not the current time

  onPlayerReady(api) {
    this.api = api;
    console.log('ON player ready event =', api);
    console.log('TIME of video 1 =', this.api.time);
    console.log('TIME of video 2 =', this.api.getMediaById('myVideo').elem);
    this.api.getMediaById('myVideo').subscriptions.loadedData.subscribe((res) => {
      console.log('HLS Bitrate', this.hlsBitrates);
      this.duration = res.target.duration;
      console.log('TARGET ===', res.target);
      console.log('THIS DURATION', this.duration)
      this.options = {
        floor: 0,
        // Ceil doit avoir pour valeur le timestamp final du stream (this.endTimestamp) qui doit ensuite être transposé en hh:mm:ss
        ceil: this.duration,
        translate: (value: number) : string => {
          return this.secondsToMinutesAndSeconds(value);
        },
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

    console.log('VGHLS', this.vgHls);

    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      (med) => {
        console.log('MED', med.time);
        // Set the video to the beginning
        this.api.getDefaultMedia().currentTime = 0;
      }
    );


  }

  /**
   * Get info from the video stream when it starts to be received
   * @param event
   * @param hls
   */
  onGetBitrates(event, hls) {
    console.log('EVENT', event);
    // Fetch the current frame with timecode and thumbnail ?
    console.log('HLS', hls.hls);
   
    this.api.getMediaById('myVideo').subscriptions.loadedData.subscribe((res) => {
      const duration = res.target.duration;
      console.log('HLS DURATION 1', duration)
      console.log('HLS TARGET', res.target)

      // Fetch the thumbnail from the currentTime of the video
      fromEvent(hls.hls, 'hlsFragLoaded').subscribe((val) => {
          console.log('Event FRAG', val);
          // Get the thumb for TCIN (currentTime of video)
          // BUG 1: si on bouge le curseur du player on change le thumb (alors qu'il ne devrait changer que si le curseur de la timeline bouge)
          // BUG 2 : on ne peut pas afficher le thumb pour le TCOUT
          console.log('THUMB TCIN ET OUT', this.tcinSec, this.tcoutSec)
          console.log('HLS FRAG ===', val[1].frag);
          const currentFragmentTimestamp = val[1].frag.programDateTime;
          console.log('CURRENT TIMESTAMP', currentFragmentTimestamp)
          const secondsElapsed = val[1].frag.start;
          console.log('SECONDS ELAPSED', secondsElapsed);
          // Convert ms to sec
          this.startTimestamp = (currentFragmentTimestamp / 1000) - secondsElapsed ;
          console.log('FIRST TIMESTAMP', this.startTimestamp)
          console.log('DURATION 2', duration)
          this.endTimestamp = this.startTimestamp + duration;
          console.log('END TIMESTAMP', this.endTimestamp)

          this.startTime = moment.unix( this.startTimestamp).format('HH:mm:ss');
          this.endTime = moment.unix( this.endTimestamp).format('HH:mm:ss');
          // Time is local dateTime and not GMT
          console.log('STARTIME ENDTIME', this.startTime, this.endTime);

          this.thumb = val[1].frag.tagList[2][1];
          console.log('THUMB in ongetBitrates', this.thumb)
        }
      );
    })

  }


  private secondsToMinutesAndSeconds(dataSeconds: number): string {
    const minutes = Math.floor(dataSeconds / 60);
    const seconds = dataSeconds % 60;
    return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
  }

  /**
   * Launched when the userChange event is fired from the timeline
   * @param val
   */
  updateValue(val) {
    console.log('VAL', val);
    this.api.getMediaById('myVideo').currentTime = val.value;
    this.tcinSec = val.value;
    this.tcoutSec = val.highValue;
    this.tcin = this.secondsToMinutesAndSeconds(val.value);
    this.tcout = this.secondsToMinutesAndSeconds(val.highValue);

    // Voir comment obtenir le thumb pour le tcout
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
