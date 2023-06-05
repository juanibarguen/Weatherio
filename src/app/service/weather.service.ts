import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  // Ejemplo probado en Postman
  // https://api.openweathermap.org/data/2.5/weather?q=London&appid=a3affa3e3df25f10c609f877595f4d82
  // https://api.openweathermap.org/data/2.5/forecast?q={city name}&appid=a3affa3e3df25f10c609f877595f4d82


  private apiKey = 'a3affa3e3df25f10c609f877595f4d82'
  city: string | undefined

  constructor(private http: HttpClient) { }

  currentWeather(city: string): Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}`);
  }

  forecast(city:string): Observable<any> {
    return this.http.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}`);
  }

  // airpollution(city: string): Observable<any> {
  //   return this.currentWeather(city).pipe(
  //     switchMap((weatherData: any) => {
  //       const lat = weatherData.coord.lat;
  //       const lon = weatherData.coord.lon;
  //       const start = /* valor del timestamp de inicio */;
  //       const end = /* valor del timestamp de fin */;
  //       return this.http.get(`http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${this.apiKey}`);
  //     })
  //   );
  // }

  airpollution(city: string): Observable<any> {
    return this.currentWeather(city).pipe(
      switchMap((weatherData: any) => {
        const lat = weatherData.coord.lat;
        const lon = weatherData.coord.lon;
        
        return this.http.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${this.apiKey}`);
      })
    );
  }
  
  

}
