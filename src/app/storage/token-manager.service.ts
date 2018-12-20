import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {
  private apiTokenKey = 'api_token';

  constructor() {
  }

  store(content: any) {
    console.log('CONTENT', content);
    localStorage.setItem(this.apiTokenKey, JSON.stringify(content));
  }

  retrieve(): any {
    const storedToken = JSON.parse(localStorage.getItem(this.apiTokenKey));
    console.log('Token in token manager', storedToken);
    if (!storedToken) {
      throw new Error('No Token Found');
    }
    return storedToken;
  }

}
