import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, Title, Meta } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductsModule } from './products/products.module';
import { APP_ID } from '@angular/core';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ProductsModule
  ],
  providers: [
    provideClientHydration(),
    { provide: APP_ID, useValue: 'serverApp' },
    Title, Meta
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }