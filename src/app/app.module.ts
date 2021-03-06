import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { WinRefService } from './services/win-ref.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import Swal from 'sweetalert2';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import {GoogleAnalyticsService} from './services/google-analytics.service';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SmartContractComponent } from './smart-contract/smart-contract.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';

@NgModule({
  declarations: [
    AppComponent,
    SmartContractComponent,
    TermsConditionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    NgxSpinnerModule
    

  ],
  providers: [WinRefService,GoogleAnalyticsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
