import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CrossTheAges';
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-FBRDP2CXSF',
          {
            'page_path': event.urlAfterRedirects
          }
        );
      }
    }
    )
  }




}
