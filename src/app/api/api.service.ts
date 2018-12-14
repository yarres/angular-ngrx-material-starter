import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  login(username, password): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      `${this.apiUrl}/ajaxLogin`, { _username: username, _password: password });
  }
}
