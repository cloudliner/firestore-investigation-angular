import { Injectable } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';


@Injectable()
export class UserAuthService {

  own_user;

  constructor(public afAuth: AngularFireAuth) {

    afAuth.authState.subscribe((auth: any) => {
      if (auth && auth.uid) {
        console.log('auth.uid', auth.uid);
        const  full_name = auth.displayName || ' ';
        const split_name_arr = full_name.split(' ');
        const photoURL = auth.photoURL || '';
        const own_user_id = auth.uid;

        this.own_user = {
            id: own_user_id,
            fb_id: null,
            loggedIn : true,
            full_name : full_name,
            short_name: split_name_arr[0],
            pict_src : photoURL
        };
      }
    });
   }


   get_own_id() {
    if (this.own_user && this.own_user.id) {
      return this.own_user.id;
    }
    return null;
   }

  login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
  }




}
