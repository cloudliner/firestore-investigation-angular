import { Component, OnInit } from '@angular/core';


import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { UserAuthService } from './../user-auth.service';


@Component({
  selector: 'app-security-test',
  templateUrl: './security-test.component.html',
  styleUrls: ['./security-test.component.css']
})
export class SecurityTestComponent implements OnInit {

  test_itemsCollection: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore,
    private userAuthService: UserAuthService) { }

  ngOnInit() {
    this.test_itemsCollection = this.afs.collection<any>('test-data');
    this.test_itemsCollection.valueChanges().subscribe( () => {
      console.log('test item');
    });
  }

  add_testdata() {
    this.test_itemsCollection.add({test: 'aaa'})
      .then(() => {
        console.log('saving test data succeed');
      }).catch((err) => {
        console.log('fail to save test data', err);
      });

  }

}
