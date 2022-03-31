import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LambdaApiService {
    //Get matic from site 
    private endpointLambda = 'https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/mintingSite?tab=configure' 
  
    constructor(private http: HttpClient) { }

    public getMessage()
    {
        return  this.http.get<any>(this.endpointLambda);
    }
}
