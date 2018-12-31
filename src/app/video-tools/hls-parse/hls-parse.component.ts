import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { Observable, fromEvent, throwError} from 'rxjs';
import { map } from 'rxjs/operators';

import * as m3u8Parser from 'm3u8-parser'

@Component({
  selector: 'anms-hls-parse',
  templateUrl: './hls-parse.component.html',
  styleUrls: ['./hls-parse.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HlsParseComponent implements OnInit {
  fileToUpload: File = null;
  constructor(private http: HttpClient) { }



  ngOnInit() {
    // const fileUrl = 'assets/playlist.m3u8';
    // const mp4File = new File(file, fileUrl);
    // console.log('MP4 file', mp4File);
    // this.getFile(fileUrl).subscribe((file) => {
    //   console.log('FILE ===', file);
    //   const mp4File = new File(file, fileUrl);
    //   const fileReader = new FileReader();
    //   fileReader.onload = (e) => {
    //     console.log(fileReader.result);
    //   }
    //   fileReader.readAsText(mp4File);
    // })
    



  }

  // fileParse(file: File) : any {
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //       console.log(reader.result);
  //   };
  //   reader.readAsText(file);
  // }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    const fileReader = new FileReader();
    const thumbs = [];
    fileReader.onload = (e) => {
      console.log('loaded FILE =====');
      const loadedFile = fileReader.result as string;
      const allLines = loadedFile.split(/\r\n|\n/);
      const parser = new m3u8Parser.Parser();
      parser.push(loadedFile);
      parser.end();

      const parsedManifest = parser.manifest;
      console.log('PARSED lines', parsedManifest)

      // Reading line by line
      allLines.forEach((line, index) => {
          console.log('LINE ==', line);
          let dateTime;
          let lineNumber;
          if (line.match(new RegExp(/^\#EXT-X-PROGRAM-DATE-TIME/))) {
            dateTime =  line.split(':')[1];
            console.log('DATETIME ==', dateTime);
            lineNumber = index;
            console.log('lineNumber 1 ==', lineNumber);
          }
          if (line.match(new RegExp(/^\#EXT-X-THUMBNAIL/)) && lineNumber === (index + 1)) {
            console.log('LINE OF THUMB', line, dateTime, lineNumber);
            thumbs.push({
              timeLapse: {
                start: dateTime
              },
              params: {
                thumbnail: `https:${line.split(':')[1]}`
              }
            });
            console.log('THUMBS BEFORE', thumbs)
          }
         
      });
      console.log('THUMBS AFTER ===', thumbs);
    }
    fileReader.readAsText(this.fileToUpload);
  }

}
