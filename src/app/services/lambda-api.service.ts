import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LambdaApiService {
  //Get matic from site 
  private endpointLambda = 'https://r7s74pt7yk.execute-api.us-east-1.amazonaws.com/prod/Lambda-function-PremiumPack'

  constructor(private http: HttpClient) { }
  public sendMsg(msg: any) {
    const body = {
      address: msg,
    }
    return this.http.post(this.endpointLambda, body)
  }
}