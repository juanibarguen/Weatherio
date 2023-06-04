import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../service/weather.service';


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit{
  city!:string;
  weatherData: any = {};

  constructor( private apiService: WeatherService) {}

  ngOnInit(): void {
  }

  convertToCelsius(tempKelvin: number): number {
    return tempKelvin - 273.15;
  }

  convertToFahrenheit(tempKelvin: number): number {
    return Math.floor((tempKelvin - 273.15) * (9/5) + 32);
  }
  
  getWeather() {
    this.apiService.getData(this.city).subscribe(data => {
      this.weatherData = data;
      console.log(data);

      if (this.weatherData.main && this.weatherData.main.temp) {
        const tempCelsius = this.convertToCelsius(this.weatherData.main.temp);
        this.weatherData.main.temp = Math.round(tempCelsius);
        // this.weatherData.main.tempFahrenheit = Math.floor(this.convertToFahrenheit(this.weatherData.main.temp)); 
      }
    });
      
  }

}
