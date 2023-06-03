import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../service/weather.service';


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit{
  city!:string;
  weatherData: any[] = [];

  constructor( private apiService: WeatherService) {}

  ngOnInit(): void {
  }

  getWeather() {
    this.apiService.getData(this.city).subscribe(data => {
      this.weatherData = data;
      console.log(data);
      
    })
  }
}
