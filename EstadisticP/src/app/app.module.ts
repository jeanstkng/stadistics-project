import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TablaComponent } from './tabla/tabla.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { NvD3Module } from 'ng2-nvd3';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire';

@NgModule({
  declarations: [
    AppComponent,
    TablaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    FormsModule,
    HighchartsChartModule,
    NvD3Module,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
