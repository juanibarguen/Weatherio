import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  // Ejemplo probado en Postman
  // https://api.openweathermap.org/data/2.5/weather?q=London&appid=a3affa3e3df25f10c609f877595f4d82
  // https://api.openweathermap.org/data/2.5/forecast?q={city name}&appid=a3affa3e3df25f10c609f877595f4d82


  private apiKey = 'a3affa3e3df25f10c609f877595f4d82'

  constructor(private http: HttpClient) { }

  currentWeather(city: string): Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}`);
  }

  forecast(city:string): Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}`);
  }



}
