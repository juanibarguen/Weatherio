import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  // Ejemplo probado en Postman
  // https://api.openweathermap.org/data/2.5/weather?q=London&appid=a3affa3e3df25f10c609f877595f4d82
  // https://api.openweathermap.org/data/2.5/forecast?q={city name}&appid=a3affa3e3df25f10c609f877595f4d82


  // private apiKey = 'a3affa3e3df25f10c609f877595f4d82'
  private apiKey2 = '5a2129314f5ee33b438022ad4fdea36b'
  city: string

  constructor(private http: HttpClient) {
    this.city = 'Buenos aires';
   }

  currentWeather(city: string): Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey2}`);
  }

  currentWeatherByCord(lat:number, lon:number): Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey2}`)
  }


  forecast(city:string): Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey2}`);
  }

  geo(query:string) {
    return this.http.get(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${this.apiKey2}`)
  }
  
}
