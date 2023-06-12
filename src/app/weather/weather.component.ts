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
    let period = 'AM';
  
    if (currentHour >= 12) {
      period = 'PM';
      if (currentHour > 12) {
        currentHour -= 12;
      }
    }
  
    return `${currentHour}:${currentMinute} ${period}`;
  }
  
  
  
   


  

  constructor(
    private weatherService: WeatherService,
    private http: HttpClient,
  ) {}


  ngOnInit(): void {
    console.log(this.getToday());
    

    this.getCurrentWeather();
    this.getForecast(this.weatherService.city);
    this.observerChangeSearch();
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
      }
    )
  }

  getCurrentWeather(): void {
    this.weatherService.currentWeather(this.weatherService.city).subscribe(
      (data: any) => {
        this.currentWeatherData = data;
        console.log(this.currentWeatherData);

        if (data.visibility) {
          console.log('Visibilidad:', data.visibility);
        } else {
          console.log('No se encontró información de visibilidad.');
        }
        
      },
      (error: any) => {
        console.error('Error al obtener el clima actual:', error);
      }
    );
  }

  getForecast(city: string): void {
    this.weatherService.forecast(city)
      .subscribe(
        (data: any) => {
          this.forecastData = data; // Asignamos los datos del pronóstico a la variable
          // Aquí puedes realizar cualquier acción adicional con los datos del pronóstico
          console.log(this.forecastData);
          
        },
        (error: any) => {
          console.error('Error al obtener el pronóstico:', error);
        }
      );
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
