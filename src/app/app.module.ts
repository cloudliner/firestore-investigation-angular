import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { EventComponent } from './event/event.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { UserAuthService } from './user-auth.service';
import { SecurityTestComponent } from './security-test/security-test.component';
import { Event2Component } from './event2/event2.component';

@NgModule({
  declarations: [
    AppComponent,
    EventComponent,
    SecurityTestComponent,
    Event2Component
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
  ],
  providers: [UserAuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
