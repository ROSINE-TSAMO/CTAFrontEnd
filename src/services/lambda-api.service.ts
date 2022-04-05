import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LambdaApiService {
    //Get matic from site 
    private endpointLambda = 'https://r7s74pt7yk.execute-api.us-east-1.amazonaws.com/prod/Lambda-function-PremiumPack' 
  
    constructor(private http: HttpClient) { }

    public getMessage()
    {
        return  this.http.get<any>(this.endpointLambda);
    }

    public sendMsg(msg : any, card:any) {
      const headers = { 'content-type': 'application/json',
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*"
    }  
      const body = {
        msg: msg,
        card: card
      }
      return this.http.post(this.endpointLambda, body, {'headers':headers})
    }
}
