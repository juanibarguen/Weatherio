import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../service/weather.service';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit{
  currentDate: Date = new Date();
  city!:string;
  weatherData: any = {};
  forecastData: any[] = [];
  formattedDateEnUs:string | undefined;
  formattedDateEs:string | undefined;


  constructor( private apiService: WeatherService) {}

  ngOnInit(): void {
    // obtenemos la fecha actual en el formato indicado: 'Sunday 4, Jun'
    // EN
    this.formattedDateEnUs = format(this.currentDate, "EEEE d, MMM", { locale: enUS });
    // ES
    this.formattedDateEs = format(this.currentDate, "EEEE d, MMM", { locale: es });
  }

  getWeather() {
    this.apiService.currentWeather(this.city).subscribe(data => {
      this.weatherData = data;
      // console.log(data);

      if (this.weatherData.main && this.weatherData.main.temp) {
        const tempCelsius = this.convertToCelsius(this.weatherData.main.temp);
        this.weatherData.main.temp = Math.round(tempCelsius);
        // this.weatherData.main.tempFahrenheit = Math.floor(this.convertToFahrenheit(this.weatherData.main.temp)); 
      }
      console.log(data);
    });
    this.city = ''; 
  }

  getForecast() {
    if (this.city) {
      this.apiService.forecast(this.city).subscribe(data => {
        this.forecastData = data.list.slice(0, 5).map((item: any) => ({
          main: item.weather[0].main,
          temp: item.main.temp
        }));
        console.log(this.forecastData);
      });
    }
  }

  executeFunctions() {
    this.getForecast();
    this.getWeather();
  }

  getNextDate(index: number): Date {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + index + 1);
    return currentDate;
  }

  convertToCelsius(tempKelvin: number): number {
    const tempCelsius = tempKelvin - 273.15;
    return Math.floor(tempCelsius);
  }

  convertToFahrenheit(tempKelvin: number): number {
    return Math.floor((tempKelvin - 273.15) * (9/5) + 32);
  }

  metersToKilometers(meters: number) {
    var kilometers = meters / 1000;
    return kilometers;
  }
  


}
