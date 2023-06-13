import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../service/weather.service';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {


  list:boolean = true;

  currentWeatherData: any; // Acceder al endpoint Current de la API
  forecastData: any; // Acceder al endpoint Forecast de la API

  // Coordenadas actuales
  latitude!: number
  longitude!: number;

  // Creamos instancia de FormControl, arrays para almacenar la lista de ciudades relacionadas con lo escrito en el input
  control = new FormControl();
  cities: any[] = [];
  showCitiesList: boolean = true;
  city!:string

 // Almacenan datos sobre a la hora actual 
  currentTime = new Date();
  currentHour: any
  currentMinute:any
  today:any

  // Array que almacena el pronostico de las proximas 8 horas
  forecastTimes: any[] = [];
  // Array que almacena el pronostico de los proximos 5 dias
  forecastDays: any[] = [];

  // Variable que activa
  activeTab: string = "";

  // Variable para realizar el seguimiento del estado de temperatura seleccionado
  selectedTemperature: string = 'C'; // Valor inicial en Celsius
  
  constructor(
    private weatherService: WeatherService,
    private http: HttpClient,
    ) {}
    
    ngOnInit(): void {
      // Valor default
      this.activeTab = "today";

      this.getCurrentWeather();
      this.getForecast(this.weatherService.city);
      this.observerChangeSearch();
    }


// Función para cambiar el estado de temperatura seleccionado
toggleTemperature(temperature: string): void {
  this.selectedTemperature = temperature;
}

// Función para obtener el nombre del día de la semana en inglés
getDayOfWeek(date: string): string {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const parts = date.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Los meses en JavaScript son indexados desde 0
  const day = parseInt(parts[2]);

  const dayOfWeekIndex = new Date(year, month, day).getDay();

  return daysOfWeek[dayOfWeekIndex];
}


  //Acceder a datos al dia 
  getToday(): string {
      const currentDate = new Date();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const year = currentDate.getFullYear().toString();
      return `${month}/${day}/${year}`;
  }
    
  getCurrentTime(): string {
      const currentTime = new Date();
      let currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();

    
      return `${currentHour}:${currentMinute}`;
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude
        this.longitude = position.coords.longitude
        console.log('Ubicación actual:', this.latitude ,this.longitude );
        this.getCurrentWeatherByCord()
      }, (error) => {
        console.error('Error al obtener la ubicación:', error);
      });
    } else {
      console.error('Geolocalización no soportada por el navegador.');
    }
  }

  getCurrentWeatherByCord(): void {
    this.weatherService.currentWeatherByCord(this.latitude, this.longitude).subscribe(
      (data: any) => {
        this.currentWeatherData = data
        console.log(this.currentWeatherData);

        // Vaciar la lista de pronósticos antes de agregar nuevos elementos
          this.forecastTimes = [];

        this.getForecast(data.name);
      }
    )
  }

  getCurrentWeather(): void {
    this.weatherService.currentWeather(this.weatherService.city).subscribe(
      (data: any) => {
        this.currentWeatherData = data;
        console.log(this.currentWeatherData);
      },
      (error: any) => {
        console.error('Error al obtener el clima actual:', error);
      }
    );
  }

  forecastByCord(): void {
    this.weatherService.forecastByCord(this.latitude, this.longitude).subscribe(
      (data: any) => {
        this.forecastData = data;
        console.log(this.forecastData);
  
        this.forecastTimes = []; // Reiniciar el arreglo de pronósticos
        this.forecastDays = []; // Reiniciar el arreglo de pronósticos
  
        for (let i = 0; i < 7; i++) {
          const dateTemp = this.forecastData.list[i].main.temp;
          const dateTime = this.forecastData.list[i].dt_txt;
          const dateDescrip = this.forecastData.list[i].weather[0].description;
          const time = dateTime.split(" ")[1];
          const hourAndMinute = time.substring(0, 5);
  
          let imgDescription: string; // Variable para almacenar la ruta de la imagen
  
          switch (dateDescrip) {
            case 'clear sky':
              imgDescription = 'assets/icons/icons8-sun.png';
              break;
            case 'few clouds':
            case 'scattered clouds':
            case 'overcast clouds':
            case 'broken clouds':
              imgDescription = 'assets/icons/icons8-clouds-80.png';
              break;
            case 'drizzle':
            case 'light rain':
              imgDescription = 'assets/icons/icons8-drizzle-80.png';
              break;
            case 'rain':
              imgDescription = 'assets/icons/icons8-rain-80.png';
              break;
            case 'shower rain':
              imgDescription = 'assets/icons/icons8-heavy-rain-80.png';
              break;
            case 'thunderstorm':
              imgDescription = 'assets/icons/icons8-cloud-lightning-80.png';
              break;
            case 'snow':
              imgDescription = 'assets/icons/icons8-snow-80.png';
              break;
            case 'mist':
              imgDescription = 'assets/icons/icons8-haze-80.png';
              break;
            default:
              console.log(this.forecastData.list[i].weather[0].description);
              imgDescription = 'assets/icons/default.png';
              break;
          }
  
          const forecastItem = {
            time: hourAndMinute,
            main: dateDescrip,
            temp: dateTemp,
            imgDescription: imgDescription
          };
  
          this.forecastTimes.push(forecastItem);
        }
  
        console.log(this.forecastTimes);
        // Actualizar el arreglo forecastDays para los 5 días
        for (let i = 0; i < this.forecastData.list.length; i++) {
          const forecastItem = this.forecastData.list[i];
          const dateTime = forecastItem.dt_txt;
          const date = new Date(dateTime); // Convertir la fecha y hora en un objeto de tipo Date
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const hours = date.getHours();
          const minutes = date.getMinutes();
  
          if (hours === 12 && minutes === 0) {
            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dateTemp = forecastItem.main.temp;
            const dateDescrip = forecastItem.weather[0].description;
            const imgDescription = this.getImageDescription(dateDescrip);
  
            // Verificar si el día ya existe en el arreglo forecastDays
            const existingDay = this.forecastDays.find(day => day.date === formattedDate);
            if (existingDay) {
              existingDay.temperatures.push(dateTemp);
            } else {
              this.forecastDays.push({ date: formattedDate, description: dateDescrip, temperatures: [dateTemp], imgDescription });
            }
          }
        }
        console.log(this.forecastDays);
      },
      (error: any) => {
        console.error('Error al obtener el pronóstico:', error);
      }
    );
  }

  updateWeatherData(cityName:string,lat: number,lon:number,) {
    console.log("Ciudad seleccionada: "+cityName);
    
    this.latitude = lat; // Actualiza el valor de la latitud en la clase
    this.longitude = lon; /// Actualiza el valor de la longitud en la clase
    this.getCurrentWeatherByCord() 

    this.weatherService.city = cityName; // Actualiza el valor de la ciudad en el servicio


    this.getForecast(cityName) // Llama al metodo con el nombre actualizado
    // Llama al pronostico con los valores lat y lon ya actualizados
    this.getCurrentWeather(); // Llama al método para obtener los datos actualizados
    this.showCitiesList = false;
  }


  getForecast(city: string): void {
    this.weatherService.forecast(city).subscribe(
      (data: any) => {
        this.forecastData = data;
        console.log(this.forecastData);
  
        this.forecastTimes = []; // Reiniciar el arreglo de pronósticos
        this.forecastDays = []; // Reiniciar el arreglo de pronósticos
  
        for (let i = 0; i < 7; i++) {
          const dateTemp = this.forecastData.list[i].main.temp;
          const dateTime = this.forecastData.list[i].dt_txt;
          const dateDescrip = this.forecastData.list[i].weather[0].description;
          const time = dateTime.split(" ")[1];
          const hourAndMinute = time.substring(0, 5);
  
          let imgDescription: string; // Variable para almacenar la ruta de la imagen
  
            

  
          const forecastItem = {
            time: hourAndMinute,
            main: dateDescrip,
            temp: dateTemp,
            imgDescription: this.getImageDescription(dateDescrip)
          };
  
          this.forecastTimes.push(forecastItem);
        }
  
        console.log(this.forecastTimes);
        // Actualizar el arreglo forecastDays para los 5 días
        for (let i = 0; i < this.forecastData.list.length; i++) {
          const forecastItem = this.forecastData.list[i];
          const dateTime = forecastItem.dt_txt;
          const date = new Date(dateTime); // Convertir la fecha y hora en un objeto de tipo Date
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const hours = date.getHours();
          const minutes = date.getMinutes();
  
          if (hours === 12 && minutes === 0) {
            const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dateTemp = forecastItem.main.temp;
            const dateDescrip = forecastItem.weather[0].description;
            const imgDescription = this.getImageDescription(dateDescrip);
  
            // Verificar si el día ya existe en el arreglo forecastDays
            const existingDay = this.forecastDays.find(day => day.date === formattedDate);
            if (existingDay) {
              existingDay.temperatures.push(dateTemp);
            } else {
              this.forecastDays.push({ date: formattedDate, description: dateDescrip, temperatures: [dateTemp], imgDescription });
            }
          }
        }
        console.log(this.forecastDays);
      },
      (error: any) => {
        console.error('Error al obtener el pronóstico:', error);
      }
    );
  }
  
  getImageDescription(description: string): string {
    switch (description) {
      case 'clear sky':
        return 'assets/icons/icons8-sun.png';
      case 'few clouds':
      case 'scattered clouds':
      case 'overcast clouds':
      case 'broken clouds':
        return 'assets/icons/icons8-clouds-80.png';
      case 'drizzle':
      case 'light rain':
        case 'moderate rain':
        return 'assets/icons/icons8-drizzle-80.png';
      case 'rain':
        return 'assets/icons/icons8-rain-80.png';
      case 'shower rain':
        return 'assets/icons/icons8-heavy-rain-80.png';
      case 'thunderstorm':
        return 'assets/icons/icons8-cloud-lightning-80.png';
      case 'snow':
        return 'assets/icons/icons8-snow-80.png';
      case 'mist':
        return 'assets/icons/icons8-haze-80.png';
      default:
        console.log(description);
        return 'assets/icons/default.png';
    }
  }
  

  parseUnixTimeToHour(unixTime: number): string {
    const date = new Date(unixTime * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    let formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12; // Si formattedHours es 0, se cambia a 12
  
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
  
    return formattedHours + ':' + formattedMinutes + ' ' + ampm;
  }
  
    // CONVERTIR DE KELVIN A CELSIUS
  convertToCelsius(tempKelvin: number): number {
      const tempCelsius = tempKelvin - 273.15;
      const roundedTemp = parseFloat(tempCelsius.toFixed(1));
      return roundedTemp;
  }
    
  // CONVERTIR DE KELVIN A FAHRENHEIT
  convertToFahrenheit(tempKelvin: number): number {
    return Math.floor((tempKelvin - 273.15) * (9/5) + 32);
  }

  // Convertir de metos por segundo a kilometros por hora
  convertMpsToKph(windSpeedMps: number): string {
    const windSpeedKph = windSpeedMps * 3.6; // Velocidad del viento en kilómetros por hora
    const roundedSpeed = windSpeedKph.toFixed(1); // Redondear a un decimal
    return roundedSpeed;
  }
  
  convertMetersToKilometers(meters: number): number {
    const kilometers = meters / 1000;
    return Math.round(kilometers * 10) / 10;
  }

  observerChangeSearch() {
    this.control.valueChanges
      .pipe(debounceTime(500))
      .subscribe(query => {
        console.log(query);
      

      if (query && query.trim().length > 0) {
        this.weatherService.geo(query).subscribe(result => {
          if (Array.isArray(result)) {
            this.cities = result;
            this.showCitiesList = true;
            console.log(this.cities);
            
            //not result
          } else {
            this.cities = [];
            this.showCitiesList = false;
          }
          
        });
      } else {
        this.cities = [];
        this.showCitiesList = false;
      }
    });
  }
}

