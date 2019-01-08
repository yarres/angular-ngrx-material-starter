import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';

import { VgAPI } from 'videogular2/core';
import { Options } from 'ng5-slider';
import { ApiService } from '../api/api.service';
import { fromEvent, Observable } from 'rxjs';
import moment from 'moment';
import { remove, get } from 'lodash';

interface Thumb {
  src: string,
  sn: number,
  time: string
}
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
  allThumbnails = [];
  test: string;
  currentChannel: string;
  currentHlsStream: string;
  hlsBitrates: any;
  currentThumbnail$: Observable<string>;

  thumbnails: Thumb[] = [];

  fragments : any;

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


  private fetchThumbnails(fragments, limit = 12) {
    const allThumbs = [];
    const timelineThumbs = [];
    fragments.forEach((frag: any, index) => {
      console.log('HLS filter frag', frag );
      const thumb = frag.tagList.filter((value) => {
        console.log('HLS filter value', value );
        if (value[0] === 'EXT-X-THUMBNAIL') {
          return value;
        }
      })[0];

      console.log('HLS filter thumb', thumb );
      const  fragmentDate = frag.rawProgramDateTime;
      console.log('HLS filter fragment date', fragmentDate );
      const date = moment(fragmentDate);

      console.log('HLS filter fragment date date', date );
      console.log('HLS filter this thumbnails before', this.thumbnails );


        if (timelineThumbs.length < limit) {
          timelineThumbs.push({
            src: `https:${thumb[1]}`,
            time: date.format('HH:mm:ss'),
            sn: frag.sn
          });
        }

        allThumbs.push({
          src: `https:${thumb[1]}`,
          time: date.format('HH:mm:ss'),
          sn: frag.sn
        });

    })

    return { all: allThumbs, timeline: timelineThumbs };
  }

  /**
   * Get info from the video stream when it starts to be received
   * @param event
   * @param hls
   */
  onGetBitrates(event, hls) {
    console.log('onGetBitrates EVENT', event);
    // Fetch the current frame with timecode and thumbnail ?
    console.log('onGetBitrates HLS', hls.hls);

    fromEvent(hls.hls, 'hlsLevelLoaded').subscribe((ev) => {
      console.log('onGetBitrates hlsLevelLoaded ev', ev );
      const fragments = ev[1].details.fragments;
      // Store all the thumbnails with their time

      // Get the thumb for tcin and tcout if possible
    //  console.log('THUMB TCIN ET OUT 1', this.tcInTimestamp, this.tcOutTimestamp, this.tcin, this.tcout, this.tcinSec);

      console.log('onGetBitrates HLS LOADED DATA', fragments);
      const moduloValue = Math.ceil(fragments.length / 12);
      const reducedArr = remove(fragments, (el, ind) => {
        return ind % moduloValue === 0
    });
      // Get default zoom 12 thumbnails at regular intervals
      this.thumbnails = this.fetchThumbnails(reducedArr, 12).timeline;
      this.allThumbnails = this.fetchThumbnails(fragments).all;
      console.log('onGetBitrates allThumbnails', this.allThumbnails);

      console.log('onGetBitrates HLS this fragments', fragments )
      // Faire un traitement lodash filter ou get pour n'obtenir que les tagList puis ne garder que les src des thumbs et leur time
      const tagList = fragments.map((item) => {
        return item.tagList
      });
      console.log('onGetBitrates HLS tagList', tagList);

      console.log('onGetBitrates HLS reducedArr', reducedArr);
      console.log('onGetBitrates HLS thumbnails', this.thumbnails);
    });

    console.log('HLS thumbnails 2', this.thumbnails);

    this.api.getMediaById('myVideo').subscriptions.loadedData.subscribe((res) => {
      console.log('loadedData res', res )
      const duration = res.target.duration;
      console.log('HLS DURATION 1', duration);
      console.log('HLS TARGET', res.target);

      // Fetch the thumbnail from the currentTime of the video
      fromEvent(hls.hls, 'hlsFragLoaded').subscribe((val) => {
          console.log('Event FRAG', val);
          console.log('HLSFRAG LOADED currentTime', this.api.currentTime);

          // Get the thumb for TCIN (currentTime of video)
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
    console.log('updateValue VAL', val);
    this.api.getMediaById('myVideo').currentTime = val.value;
    this.tcinSec = val.value;
    this.tcoutSec = val.highValue;
    this.tcInTimestamp = val.value;
    this.tcOutTimestamp = val.highValue;
    this.tcin = this.timestampToHMS(val.value);
    this.tcout = this.timestampToHMS(val.highValue);
    // TODO 3 Voir comment obtenir le thumb pour le tcout
    console.log('updateValue all', this.tcinSec, this.tcoutSec, this.tcInTimestamp, this.tcoutSec, this.tcin, this.tcout )
  }

  /**
   * Move the currentTime of the player to the TCIN value
   * @param val
   */
  seekTcIn(val: Event) {
    console.log('seekTCIn', this.tcinSec, this.startTimestamp )
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
    if (!start || !end) {
      return '00:00:00';
    }
    return duration;
  }

}
