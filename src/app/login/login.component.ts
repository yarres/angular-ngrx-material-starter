import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { TokenManagerService } from '../storage/token-manager.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'anms-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private api: ApiService, private tokenManager: TokenManagerService) {
  }

  ngOnInit() {
    // this.login();
  }

  onSubmit(event) {
    console.log('FORM content', this.loginForm);
    this.login(this.loginForm);
  }

  login(form): any {
    return this.api.login(form)
      .subscribe((res) => {
          console.log('RESPONSE', res);
          this.tokenManager.store(res);
        }
      );
  }

}
