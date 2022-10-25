import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserData } from '../models/user.model';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  isLoading: boolean = true;
  user: UserData;
  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit() {
    this.authService.userId.subscribe(id => {
      this.userService.getUserInfos(id)
      .then((res: UserData) => {
        console.log(res);
        this.user = res;
        this.isLoading = false;
      })
      .catch((err) => {
        console.log(err);
        this.isLoading = false;
      })
    })
  }

  onLogout(){
    this.authService.logout();
  }

}
