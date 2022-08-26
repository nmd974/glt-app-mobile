import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  isLoading: boolean = true;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = false;
  }

  onLogout(){
    this.authService.logout();
  }

}
