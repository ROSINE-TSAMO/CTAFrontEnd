import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiMaticService {
  APIKEY = "ff274e74-cc13-4960-bb66-dfe665a53107"
  //Get matic from site https://www.coingecko.com/en/api/documentation
  private maticLink1 = "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd";

  //Get matic from site 
  private maticLink2 = 'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest' //'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'; //"https://pro-api.coinmarketcap.com/v1/cryptocurrency/map";
  
  constructor(private http: HttpClient) { }

  public getMaticFromLink1()
  {
      return  this.http.get<any>(this.maticLink1);
  }

  public getMaticFromLink2()
  {
      return  this.http.get(this.maticLink2,{headers: {'X-CMC_PRO_API_KEY': this.APIKEY,},});//
  }
}
