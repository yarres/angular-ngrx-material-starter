import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';

import { VgAPI } from 'videogular2/core';
import { Options } from 'ng5-slider';
import { ApiService } from '../api/api.service';
import { fromEvent, Observable } from 'rxjs';
import moment from 'moment';


@Component({
  selector: 'anms-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideosComponent implements OnInit {

  constructor(api: VgAPI, private internalApi: ApiService) {
    this.api = api;
  }

  tcInTimestamp: any;
  tcOutTimestamp: any;
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
  tcinSec: 0;
  tcoutSec: 35;

  tcin: string;
  tcout: string;
  // Timeline slider
  tLminValue = 0;
  tLmaxValue = 35;
  tLoptions: Options = {
    minRange: 5,
    pushRange: true,
    noSwitching: true,
    draggableRange: true
  };

  private timestampToHMS(timestamp: number): string {
    return moment.unix(timestamp).format('HH:mm:ss');
  }

  getChannels() {
    console.log('IN get channels');
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
    this.getChannels();
  }


  @HostListener('click', ['$event'])
  onClick(ev) {
    console.log('CLICK event', ev);
  }

  /**
   * Keyboard shortcuts
   * @param event
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
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

  // Current time and end time on the player and in the timeline should be the
  // programdatetime of the stream and not the current time
  onPlayerReady(api) {
    this.api = api;
    console.log('ON player ready event =', api);
    console.log('ON player ready TIME of video with api =', this.api.time);
    console.log('ON player ready Video element =', this.api.getMediaById('myVideo').elem);
    this.api.getMediaById('myVideo').subscriptions.loadedData.subscribe((res) => {
      console.log('ON player ready HLS Bitrate', this.hlsBitrates);
      this.duration = res.target.duration;
      console.log('ON player ready TARGET ===', res.target);
      console.log('ON player ready THIS DURATION, res.target.duration en secondes', this.duration);
      console.log('ON player ready this.endtimestamp', this.endTimestamp);

      console.log('OPTIONS.CEIL', this.tLoptions.ceil);
      console.log('tLminValue ', this.tLminValue);
      console.log('tLmaxValue', this.tLmaxValue);
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
      console.log('HLS DURATION 1', duration);
      console.log('HLS TARGET', res.target);

      // Fetch the thumbnail from the currentTime of the video
      fromEvent(hls.hls, 'hlsFragLoaded').subscribe((val) => {
          console.log('Event FRAG', val);
          console.log('HLSFRAG LOADED currentTime', this.api.currentTime);

          // Get the thumb for TCIN (currentTime of video)
          // BUG 1: si on bouge le curseur du player on change le thumb (alors qu'il ne devrait changer que si le curseur de la timeline bouge)
          // BUG 2 : on ne peut pas afficher le thumb pour le TCOUT
          console.log('THUMB TCIN ET OUT', this.tcinSec, this.tcoutSec);
          console.log('HLS FRAG ===', val[1].frag);
          const currentFragmentTimestamp = val[1].frag.programDateTime;
          console.log('CURRENT TIMESTAMP', currentFragmentTimestamp);
          const secondsElapsed = val[1].frag.start;
          console.log('SECONDS ELAPSED', secondsElapsed);
          // Convert ms to sec
          this.startTimestamp = (currentFragmentTimestamp / 1000) - secondsElapsed;
          console.log('FIRST TIMESTAMP', this.startTimestamp);
          console.log('DURATION 2', duration);
          this.endTimestamp = this.startTimestamp + duration;


          // Time is local dateTime and not GMT
          this.startTime = moment.unix(this.startTimestamp).format('HH:mm:ss');
          this.endTime = moment.unix(this.endTimestamp).format('HH:mm:ss');

          // TODO: get the duration of the

          this.thumb = val[1].frag.tagList[2][1];
          console.log('THUMB in ongetBitrates', this.thumb);
          // Timeline configuration
          this.tLminValue = this.startTimestamp;
          this.tLmaxValue = this.endTimestamp;
          console.log('tLminValue', this.startTimestamp);
          console.log('tLmaxValue', this.endTimestamp);
          console.log('tcinSec', this.tcinSec);
          console.log('tcoutSec', this.tcoutSec);
          console.log('tcin timestamp', this.tcInTimestamp);
          console.log('tcout timestamp', this.tcOutTimestamp);
          /*   this.tcInTimestamp = this.tLminValue;
             this.tcOutTimestamp = this.tLmaxValue;*/
          // The first time the timeline is loaded floor should be the start timestamp and and ceil the end timestamp
          // The next times, floor should be this.tcinTimestamp & ceil => this.tcoutTimestamp
          console.log('this.tcInTimestamp > this.tLminValue', this.tcInTimestamp <= this.tLminValue);
          console.log('this.tcoutTimestamp > this.tLmaxvalue', this.tcOutTimestamp >= this.tLmaxValue);

          const isMaxInterval = (this.tcInTimestamp <= this.tLminValue) && (this.tcOutTimestamp >= this.tLmaxValue);

          this.tLoptions = {
            // this.tcintimestamp => this.minValue is undefined
            // S'il y a un tcin
            // The start of the timeline
            floor: this.tLminValue,  // this.tLminValue, // TODO: doit être le tcin en timestamp
            // The end of the timeline
            ceil: this.tLmaxValue, // TODO: doit être le tcout en timestamp

            translate: (value: number): string => {
              return this.timestampToHMS(value);
            },
            minRange: 5,
            pushRange: true,
            noSwitching: true,
            draggableRange: true
          };
        }
      );
    });
  }


  private secondsToMinutesAndSeconds(dataSeconds: number): string {
    const minutes = Math.floor(dataSeconds / 60);
    const seconds = dataSeconds % 60;
    return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
  }

  /**
   * Launched when the userChange event is fired from the timeline
   * Set the currentTime of the video in the player to the value of the timeline
   * (smallest value of the slider interval).
   * Set the tcin and tcout according to the value and highvalue of the timeline.
   * @param val
   */
  updateValue(val) {
    console.log('VAL', val);
    this.api.getMediaById('myVideo').currentTime = val.value;
    this.tcinSec = val.value;
    this.tcoutSec = val.highValue;
    this.tcInTimestamp = val.value;
    this.tcOutTimestamp = val.highValue;
    this.tcin = this.timestampToHMS(val.value);
    this.tcout = this.timestampToHMS(val.highValue);
    // TODO 3 Voir comment obtenir le thumb pour le tcout
  }

  /**
   * Move the currentTime of the player to the TCIN value
   * @param val
   */
  seekTcIn(val: Event) {
    this.api.seekTime(this.tcinSec - this.startTimestamp);
  }

  seekTcOut(val: Event) {
    this.api.seekTime(this.tcoutSec - this.startTimestamp);
  }

  onEnterCuePoint(event) {
    console.log('EVENT cuepoint', event);
  }

  getCutDuration(start: number, end: number): string | Object {
    console.log('START AND END', start, end);
    const startMoment = moment(start);
    const endMoment = moment(end);
    const secondsDiff = end - start;
    const duration = moment.utc(secondsDiff * 1000).format('HH:mm:ss');

    // const duration = moment.duration(startMoment.diff(endMoment));
    console.log('duration', duration);
    if (!start || !end) {
      return '00:00:00';
    }
    return duration;
  }

}
