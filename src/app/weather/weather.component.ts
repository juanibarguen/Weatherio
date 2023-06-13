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
  currentWeatherData: any; // Acceder al endpoint Current de la API
  forecastData: any; // Acceder al endpoint Forecast de la API

  // Coordenadas actuales
  latitude!: number
  longitude!: number;

  control = new FormControl();
  cities: any[] = [];
  showCitiesList: boolean = true;
  city!:string

 // Acceder a la hora actual 
  currentTime = new Date();
  currentHour: any
  currentMinute:any
  today:any

  forecastTimes: any[] = [];
  forecastDays: any[] = [];

  activeTab: string = "today";

  // Variable para realizar el seguimiento del estado de temperatura seleccionado
selectedTemperature: string = 'C'; // Valor inicial en Celsius
  
  constructor(
    private weatherService: WeatherService,
    private http: HttpClient,
    ) {}
    
    ngOnInit(): void {
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


    //Acceder al dia 
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
<<<<<<< HEAD









//     //Obtenemos la ubicacion del usuario a travez de la IP
//     // if (navigator.geolocation) {
//     //   navigator.geolocation.getCurrentPosition((position) => {
//     //     this.latByIP = position.coords.latitude;
//     //     this.lonByIP = position.coords.longitude;
//     //     // Aquí puedes usar las coordenadas para obtener la ubicación actual del usuario
//     //     console.log("Lat: "+ typeof this.latByIP);
//     //     console.log("Lon: "+this.lonByIP);

//     //     // console.log(this.apiService.currentWeatherByCord(this.latByIP,this.lonByIP));

//     //     this.apiService.currentWeatherByCord(this.latByIP, this.lonByIP).subscribe(data => {
//     //       this.weatherData = data;
//     //       this.city = this.weatherData.name;
//     //       console.log(this.weatherData.name);

//     //       this.getForecast()
//     //       this.getPollutionAir(this.city)
//     //       this.city = ''; 

//     //     });
        

//     //   }, (error) => {
//     //     // Manejo de errores
//     //     console.log("Error: " +error);

//     //   });
//     // } else {
//     //     console.log("El navegador no admite la geolocalización");
        
//     // }

    
//     // obtenemos la fecha actual en el formato indicado: 'Sunday 4, Jun'
//     // EN
//     this.formattedDateEnUs = format(this.currentDate, "EEEE d, MMM", { locale: enUS });
//     // ES
//     this.formattedDateEs = format(this.currentDate, "EEEE d, MMM", { locale: es });
//     this.observerChangeSearch()
    
//   }

//   @HostListener('document:click', ['$event'])
//   onDocumentClick(event: MouseEvent) {
//     if (!this.myListElement.nativeElement.contains(event.target)) {
//       this.showCitiesList = false;
//     }
//   }

//   openInputSearch() {

//   }


//   observerChangeSearch() {
//     this.control.valueChanges
//       .pipe(debounceTime(500))
//       .subscribe(query => {
//         this.nombre = query;
//         console.log(this.nombre);
  
//         if (query && query.trim().length > 0) {
//           this.apiService.geo(query).subscribe(result => {
//             if (Array.isArray(result)) {
//               this.cities = result;
//               this.showCitiesList = true;
//               //not result
//             } else {
//               this.cities = [];
//               this.showCitiesList = false;
//             }
            
//           });
//         } else {
//           this.cities = [];
//           this.showCitiesList = false;
//         }
//       });
//   }
  


//   getTimeFromUnix(unixTime: number): string {
//     const date = new Date(unixTime * 1000);
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${hours}:${minutes}`;
//   }

//   getWeather() {
//     this.apiService.currentWeather(this.city).subscribe(data => {
//       this.weatherData = data;
//       // console.log(data);
//       this.description = this.weatherData.weather[0].description

//       if (this.weatherData.main && this.weatherData.main.temp) {
//         const tempCelsius = this.convertToCelsius(this.weatherData.main.temp);
//         this.weatherData.main.temp = Math.round(tempCelsius);
//         // this.weatherData.main.tempFahrenheit = Math.floor(this.convertToFahrenheit(this.weatherData.main.temp)); 
//       }
//       // console.log(data);
  
//         if (this.weatherData.sys && this.weatherData.sys.sunrise && this.weatherData.sys.sunset) {
//           this.sunriseTime = this.getTimeFromUnix(this.weatherData.sys.sunrise);
//           this.sunsetTime = this.getTimeFromUnix(this.weatherData.sys.sunset);
//           // console.log('Sunrise:', this.sunriseTime);
//           // console.log('Sunset:', this.sunsetTime);
//         }
//     });
//     this.getPollutionAir(this.city);
//     this.city = ''; 
//   }


//   getForecast() {
//     if (this.city) {
//       this.apiService.forecast(this.city).subscribe(data => {
//         this.forecastData = data.list.slice(0, 5).map((item: any) => ({
//           main: item.weather[0].main,
//           temp: item.main.temp
//         }));
//         // console.log(this.forecastData);
//       });
//     }
//   }

//   // getForecastHours() {
//   // if (this.city) {
//   //   this.apiService.forecast(this.city).subscribe(data => {
//   //     const currentDate = new Date(); // Obtiene la fecha y hora actual
//   //     const currentHour = currentDate.getHours(); // Obtiene la hora actual
//   //     let nextMultipleOfThree = Math.ceil(currentHour / 3) * 3; // Calcula la próxima hora múltiplo de 3

//   //     let count = 0;
//   //     this.forecastDataHours = []; // Reinicia el array antes de llenarlo nuevamente

//   //     for (let i = 0; i < data.list.length; i++) {
//   //       const forecastDate = new Date(data.list[i].dt_txt); // Obtiene la fecha y hora del pronóstico

//   //       // Verifica si la hora del pronóstico coincide con la hora calculada
//   //     if (forecastDate.getHours() === nextMultipleOfThree) {
//   //       const forecastHour = forecastDate.getHours().toString().padStart(2, '0'); // Obtiene la hora y ajusta el formato
//   //       const forecastTime = `${forecastHour}:00`; // Crea el formato HH:00 para la hora
//   //       this.forecastDataHours.push({
//   //         time: forecastTime,
//   //         main: data.list[i].weather[0].main,
//   //         temp: data.list[i].main.temp
//   //       });
//   //       count++;
//   //       const nextHour = nextMultipleOfThree + 3 * count; // Calcula la próxima hora múltiplo de 3 para el próximo pronóstico
//   //       nextMultipleOfThree = nextHour >= 24 ? nextHour - 24 : nextHour; // Ajusta la próxima hora si supera las 24 horas
//   //       // Verifica si se han obtenido exactamente 8 pronósticos
//   //       if (count >= 8) {
//   //         break;
//   //       }
//   //     }
//   //   }
//   // // console.log(this.forecastDataHours);
//   //   });
//   // }
//   // }

//   getPollutionAir(ciudad: string) {
//     this.apiService.airpollution(ciudad).subscribe(
//       (data: any) => {
//         this.datosContaminacionAire = data; // Asignar los datos a la variable
//         // console.log(data); // Acceder al valor de la propiedad "index"
//         // console.log(this.datosContaminacionAire.list[0].main.aqi);
//         this.indexAirPollution(this.datosContaminacionAire.list[0].main.aqi!);
//         // console.log(this.datosContaminacionAire.list[0].main.aqi!);
        
//       },
//       (error: any) => {
//         console.error(error);
//       }
//     );
    
//   }
  

//   executeFunctions() {
//     // this.getForecastHours ()
//     this.getForecast();
//     this.getWeather();
//   }

//   getNextDate(index: number): Date {
//     const currentDate = new Date();
//     currentDate.setDate(currentDate.getDate() + index + 1);
//     return currentDate;
//   }

//   convertToCelsius(tempKelvin: number): number {
//     const tempCelsius = tempKelvin - 273.15;
//     return Math.floor(tempCelsius);
//   }

//   convertToFahrenheit(tempKelvin: number): number {
//     return Math.floor((tempKelvin - 273.15) * (9/5) + 32);
//   }

//   metersToKilometers(meters: number) {
//     var kilometers = meters / 1000;
//     return kilometers;
//   }


//   indexAirPollution(value: number): void {
//     switch (value) {
//       case 1:
//         this.indexValue = "Good";
//         this.indexClass = "good";
//         // console.log("Good");
//         break;
//       case 2:
//         this.indexValue = "Fair";
//         this.indexClass = "fair";
//         // console.log("Fair");
//         break;
//       case 3:
//         this.indexValue = "Moderate";
//         this.indexClass = "moderate";
//         // console.log("Moderate");
//         break;
//       case 4:
//         this.indexValue = "Poor";
//         this.indexClass = "poor";
//         // console.log("Poor");
//         break;
//       case 5:
//         this.indexValue = "Very Poor";
//         this.indexClass = "very-poor";
//         // console.log("Very Poor");
//         break;
//       default:
//         console.log("Default case");
//         break;
//     }
//   }

//   getCoordinates(): void {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           // Obtener las coordenadas
//           const latitude = position.coords.latitude;
//           const longitude = position.coords.longitude;
//           console.log('Latitud:', latitude);
//           console.log('Longitud:', longitude);
//         },
//         (error) => {
//           console.log('Error al obtener la ubicación:', error);
//         }
//       );
//     } else {
//       console.log('La geolocalización no es soportada por este navegador.');
//     }
//   }
  
// }
=======
  
>>>>>>> 97bb8d0 (testing)
