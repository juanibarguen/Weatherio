import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../service/weather.service';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { query } from '@angular/animations';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit{
  currentDate: Date = new Date();

  control = new FormControl();


  cities: any
  filteredCities: string[] = [];
  selectedCity: string | undefined;

  cityName:any
  city!:string;
  weatherData: any = {};
  forecastData: any[] = [];
  forecastDataHours: any[] = [];
  formattedDateEnUs:string | undefined;
  formattedDateEs:string | undefined;
  datosContaminacionAire: any;
  sunriseTime: string | undefined;
  sunsetTime: string | undefined;
  description: string | undefined
  indexValueN:number | undefined;
  indexValue:string | undefined;
  indexClass: string | undefined;
  nombre: string | undefined;

  constructor( private apiService: WeatherService, private http: HttpClient) {}

  ngOnInit(): void {
    // obtenemos la fecha actual en el formato indicado: 'Sunday 4, Jun'
    // EN
    this.formattedDateEnUs = format(this.currentDate, "EEEE d, MMM", { locale: enUS });
    // ES
    this.formattedDateEs = format(this.currentDate, "EEEE d, MMM", { locale: es });
    this.observerChangeSearch()
    
  }


  observerChangeSearch() {
    this.control.valueChanges
    .pipe(
      debounceTime(500)
      )
    .subscribe(queryy => {
      this.nombre = queryy
      console.log(this.nombre);
      
      this.apiService.geo(queryy).subscribe (result => {
        console.log(result);
        this.cities = result;
      })
    })
  }




  getTimeFromUnix(unixTime: number): string {
    const date = new Date(unixTime * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // getGeo() {
  //   this.apiService.geo(nombre).subscribe (result => {
  //   })
  // }

  getWeather() {
    this.apiService.currentWeather(this.city).subscribe(data => {
      this.weatherData = data;
      // console.log(data);
      this.description = this.weatherData.weather[0].description

      if (this.weatherData.main && this.weatherData.main.temp) {
        const tempCelsius = this.convertToCelsius(this.weatherData.main.temp);
        this.weatherData.main.temp = Math.round(tempCelsius);
        // this.weatherData.main.tempFahrenheit = Math.floor(this.convertToFahrenheit(this.weatherData.main.temp)); 
      }
      // console.log(data);
  
        if (this.weatherData.sys && this.weatherData.sys.sunrise && this.weatherData.sys.sunset) {
          this.sunriseTime = this.getTimeFromUnix(this.weatherData.sys.sunrise);
          this.sunsetTime = this.getTimeFromUnix(this.weatherData.sys.sunset);
          // console.log('Sunrise:', this.sunriseTime);
          // console.log('Sunset:', this.sunsetTime);
        }
    });
    this.getPollutionAir(this.city);
    this.city = ''; 
  }

  getForecast() {
    if (this.city) {
      this.apiService.forecast(this.city).subscribe(data => {
        this.forecastData = data.list.slice(0, 5).map((item: any) => ({
          main: item.weather[0].main,
          temp: item.main.temp
        }));
        // console.log(this.forecastData);
      });
    }
  }

  getForecastHours() {
  if (this.city) {
    this.apiService.forecast(this.city).subscribe(data => {
      const currentDate = new Date(); // Obtiene la fecha y hora actual
      const currentHour = currentDate.getHours(); // Obtiene la hora actual
      let nextMultipleOfThree = Math.ceil(currentHour / 3) * 3; // Calcula la próxima hora múltiplo de 3

      let count = 0;
      this.forecastDataHours = []; // Reinicia el array antes de llenarlo nuevamente

      for (let i = 0; i < data.list.length; i++) {
        const forecastDate = new Date(data.list[i].dt_txt); // Obtiene la fecha y hora del pronóstico

        // Verifica si la hora del pronóstico coincide con la hora calculada
      if (forecastDate.getHours() === nextMultipleOfThree) {
        const forecastHour = forecastDate.getHours().toString().padStart(2, '0'); // Obtiene la hora y ajusta el formato
        const forecastTime = `${forecastHour}:00`; // Crea el formato HH:00 para la hora
        this.forecastDataHours.push({
          time: forecastTime,
          main: data.list[i].weather[0].main,
          temp: data.list[i].main.temp
        });
        count++;
        const nextHour = nextMultipleOfThree + 3 * count; // Calcula la próxima hora múltiplo de 3 para el próximo pronóstico
        nextMultipleOfThree = nextHour >= 24 ? nextHour - 24 : nextHour; // Ajusta la próxima hora si supera las 24 horas
        // Verifica si se han obtenido exactamente 8 pronósticos
        if (count >= 8) {
          break;
        }
      }
    }
  // console.log(this.forecastDataHours);
    });
  }
  }

  getPollutionAir(ciudad: string) {
    this.apiService.airpollution(ciudad).subscribe(
      (data: any) => {
        this.datosContaminacionAire = data; // Asignar los datos a la variable
        // console.log(data); // Acceder al valor de la propiedad "index"
        // console.log(this.datosContaminacionAire.list[0].main.aqi);
        this.indexAirPollution(this.datosContaminacionAire.list[0].main.aqi!);
        console.log(this.datosContaminacionAire.list[0].main.aqi!);
        
      },
      (error: any) => {
        console.error(error);
      }
    );
    
  }
  

  executeFunctions() {
    this.getForecastHours ()
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


  indexAirPollution(value: number): void {
    switch (value) {
      case 1:
        this.indexValue = "Good";
        this.indexClass = "good";
        console.log("Good");
        break;
      case 2:
        this.indexValue = "Fair";
        this.indexClass = "fair";
        console.log("Fair");
        break;
      case 3:
        this.indexValue = "Moderate";
        this.indexClass = "moderate";
        console.log("Moderate");
        break;
      case 4:
        this.indexValue = "Poor";
        this.indexClass = "poor";
        console.log("Poor");
        break;
      case 5:
        this.indexValue = "Very Poor";
        this.indexClass = "very-poor";
        console.log("Very Poor");
        break;
      default:
        console.log("Default case");
        break;
    }
  }
  
}
