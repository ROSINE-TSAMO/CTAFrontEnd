import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { WinRefService } from '../services/win-ref.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SmartContractComponent } from './smart-contract/smart-contract.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { FlexLayoutModule } from '@angular/flex-layout';

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
    FlexLayoutModule
  ],
  providers: [WinRefService],
  bootstrap: [AppComponent]
})
export class AppModule { }
