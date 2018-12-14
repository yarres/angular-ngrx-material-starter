import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
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

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    // this.login();
  }

  onSubmit(event) {
    console.log('FORM content', event);
    this.login(this.loginForm.username, this.loginForm.password);
  }

  login(username, password): any {
    return this.api.login(username, password).subscribe((res) => {
        console.log('RESPONSE', res);
      }
    );
  }

}
