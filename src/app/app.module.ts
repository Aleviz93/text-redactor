import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { OAuthModule } from 'angular-oauth2-oidc';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponentsModule } from './components/components.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MatDatepickerModule, MatMenuModule, MatNativeDateModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MenuForFormattComponent } from './pages/text-redactor/menu-for-formatt/menu-for-formatt.component';
import { TextRedactorComponent } from './pages/text-redactor/text-redactor.component';

@NgModule({
  declarations: [
    AppComponent,
    TextRedactorComponent,
    MenuForFormattComponent,
  ],
  imports: [
    OAuthModule.forRoot(),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    PerfectScrollbarModule,
    AppComponentsModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AppComponentsModule,
    DragDropModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
