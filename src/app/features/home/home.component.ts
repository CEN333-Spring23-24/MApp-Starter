import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MContainerComponent } from '../../m-framework/m-container/m-container.component';
import { MMapComponent } from '../../m-framework/m-map/m-map.component';
import { FirebaseService } from '../../services/firebase.service';
//@ts-ignore
declare var google; // Forward Declaration
 
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MContainerComponent,CommonModule,FormsModule, MMapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  lat: number;
  lng: number;
 
  map: any;
  marker: any;
  circle: any;
 
  fences: any[];
 
  constructor(private firebaseService: FirebaseService){
    this.lat = 0;
    this.lng = 0;
    this.fences = [];
  }
  
  ngOnInit(){
    this.getLocation();
  }

  drawCircle(latitude: number,longitude: number, radius: number, changable: boolean ){
    const circle = new google.maps.Circle(
      {
        map: this.map,
        radius: radius,
        center:{ lat: latitude, lng: longitude },
        editable: changable
      }
      
    );
  }
  drawMarker(latitude: number, longitude: number){
    const marker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: this.map,
    });
  }

  drawCircleOnClick() {
    if (this.map) {
      google.maps.event.addListener(this.map, 'dblclick',(event:any)=>{
        console.log("You pressed on "+event.latLng.lat()+ " "+ event.latLng.lng());
        this.drawCircle(event.latLng.lat(),event.latLng.lng(),100, true);
        let fence = {lat:event.latLng.lat(), lng:event.latLng.lng(), radius: 100};
        this.fences.push(fence);
        this.upload2Firebase(fence);
      });
      
    }
  }
  addMarkerOnClick() {
    if (this.map) {
      google.maps.event.addListener(this.map, 'rightclick', (event: any) => {
        console.log("Adding marker at " + event.latLng.lat() + ", " + event.latLng.lng());
        this.drawMarker(event.latLng.lat(),event.latLng.lng()); 
      });
    }
  }
  getMapInstance(map: any) {
    this.map = map;
    this.drawCircleOnClick();
    this.addMarkerOnClick();
  }
  initMap() {
    if (this.map) {
      this.map.setCenter({ lat: this.lat, lng: this.lng });
    }
  }
  getLocation(){
    navigator.geolocation.getCurrentPosition((data)=>{
      this.lat = data.coords.latitude;
      this.lng = data.coords.longitude;
      this.initMap();
    });
  }
 
  upload2Firebase(fence: any){
    this.firebaseService.addToList("/Fences",fence)
  }
  getFences(){
    this.firebaseService.readList("/Fences").then((data)=>{
      console.log(data);
    })
  }
  
}
 