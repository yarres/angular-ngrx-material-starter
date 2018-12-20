import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TokenManagerService } from '../storage/token-manager.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = environment.apiUrl;
  apiCutUrl = environment.apiCutUrl;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
      /*      'Access-Control-Allow-Headers': '*',*/
      /* 'Access-Control-Allow-Origin': 'https://advr-preprod-api.hexaglobe.net/'*/
    })
  };

  constructor(private http: HttpClient, private tokenManager: TokenManagerService) {
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was:  ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  login(body): Observable<any> {
    console.log('BODY', body);
    return this.http.post<any>(
      `${this.apiUrl}/ajaxLogin`,
      { _username: body.value.username, _password: body.value.password },
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  getChannels(): Observable<any> {
    const token = this.tokenManager.retrieve();
    console.log('Token in api service', token);
    return this.http.get<any>(
      `${this.apiUrl}/api/1.0/admin/channels.json`,
      {
        headers: new HttpHeaders({
          'Content-type': 'application/x-www-form-urlencoded',
          /*   'Access-Control-Allow-Origin': '*',*/
          'ApiKey': `${token.apikey}`
          /* 'Access-Control-Allow-Origin': 'https://advr-preprod-api.hexaglobe.net/'*/
        })
      }
    ).pipe(
      catchError(this.handleError)
    );
  }


  getPlaylist(channel: any) {
    return `${this.apiCutUrl}/getPlaylist.php?channel=${channel.alternativeIdentifier}&start=1545124860`;

  }
}
