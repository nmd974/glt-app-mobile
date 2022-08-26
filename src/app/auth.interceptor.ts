import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth/auth.service";



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  authToken: string = "";
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.authService.token.subscribe(token => {
      this.authToken = token;
    })
    if(this.authToken){
      const authRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });
      return next.handle(authRequest);
    }
    return next.handle(req);
  }
}
