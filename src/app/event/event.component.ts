import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { UserAuthService } from './../user-auth.service';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';

interface EventItem {
  name: string;
  text?: string;
  created_date: Date;
  event_date: Date;
  created_by?: string;
  participant_collection?: AngularFirestoreCollection<string>;
  participant_obj?: User;
  participant_arr?: string[];
}
interface EventItemWithId extends EventItem {
  id?: string;
}

interface User {
  [key: string]: Date;
}


@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {


  private event_itemsCollection: AngularFirestoreCollection<EventItem>;
  event_items_participant_time_query$: Observable<EventItem[] | {}>;
  event_snapshot_items$: Observable<EventItemWithId[]>;
  participant_query_name$ = new BehaviorSubject('');

  constructor(private afs: AngularFirestore,
    private userAuthService: UserAuthService) { }

  ngOnInit() {

    this.event_itemsCollection = this.afs.collection<EventItem>('event_related-event');
    this.event_itemsCollection.valueChanges().subscribe(() => {
      console.log('succeed');
    },
    (err) => {
      console.log('err', err);
    });

    this.event_items_participant_time_query$ =
    this.participant_query_name$.switchMap( (name: string) => {

      if (name) {
        return this.afs.collection<EventItem>('event_related-event',
        (ref) => {
          return ref.where(`participant_obj.${name}`, '>', new Date());
        })
        .valueChanges();
      } else {
        return Observable.of( [] );
      }
    });

    this.event_snapshot_items$  =
    this.event_itemsCollection.snapshotChanges().map(actions => {
      console.log(actions);
      return actions.map(a => {
        const type = a.type;
        const data = a.payload.doc.data() as EventItem;
        const id = a.payload.doc.id;
        return {id, ...data};
      });
    })
    .map((data: EventItemWithId[]) => {

      return data.map((event_item: EventItemWithId) => {

        const participant_obj = event_item.participant_obj;
        const participant_arr: string[] = [];
        for (const key in participant_obj) {
          participant_arr.push(key);
        }

        return Object.assign(event_item, {participant_arr});
      });
    });

  }


  addevent(name) {
    const event_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10 );
    this.event_itemsCollection.add({name,  event_date, created_date: new Date() })
    .then(() => {
      console.log('succeed to add event');
    }).catch( (err) => {
      console.log('error to add event', err);
    });
  }

  addevent_2(name) {

    const own_user_id = this.userAuthService.get_own_id();

    const event_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10 );
    const own_user_obj = {};
    own_user_obj[own_user_id] = event_date;
    const event_context = {
                          name,
                          event_date,
                          created_by: own_user_id,
                          created_date: new Date(),
                          participant_obj: own_user_obj
                        };
    console.log('event_context', event_context);

    this.event_itemsCollection.add(event_context)
    .then(() => {
      console.log('succeed to add event');
    }).catch( (err) => {
      console.log('error to add event', err);
    });
  }



  edit_event(event_id: string) {

    const eventDoc = this.afs.doc<EventItem>('event_related-event/' + event_id);
    eventDoc.update({event_date: new Date()})
      .then(() => {
        console.log('edit event succeed');
      })
      .catch(() => {
        console.log('edit event failed');
      });

  }

  edit_event_2(event_id: string, date: Date) {

    const own_user_id = this.userAuthService.get_own_id();
    // const own_user_obj: User = {};
    // own_user_obj[own_user_id] = date || new Date();
    const event_context = {
      event_date: new Date( Date.now() + 1000 * 60 * 60 * 24 * 7),
      // participant_obj: own_user_obj
    };
    console.log('event_context', event_context);
    const eventDoc = this.afs.doc<EventItem>('event_related-event/' + event_id);
    eventDoc.update(event_context)
      .then(() => {
        console.log('succeed to save');
      }).catch((err) => {
        console.log('fail to update', err);
      });

  }


  add_participant(event_id: string, name: string, date: Date) {

    const eventDoc = this.afs.doc<any>('event_related-event/' + event_id );
    const eventCollection = eventDoc.collection('participant_collection');

    this.afs.doc<any>('event_related-event/' + event_id );
    const participant_obj: User = {};
    participant_obj[`participant_obj.${name}`] = date;

    eventDoc.update(participant_obj).then(() => {
      console.log('saving document succeed');
      eventCollection.add({user: name});
    }).then( (data) => {
      console.log('saving collection succeed', data);
    }).catch((err) => {
      console.log(err);
    });

  }

  add_participant_2(event_id: string, name: string, date: Date) {

    const eventDoc = this.afs.doc<any>('event_related-event/' + event_id );
    const eventCollection = eventDoc.collection('participant_collection_2');
    const participantUserDoc = eventCollection.doc(name);

    participantUserDoc.set( {date} ).then(() => {
      console.log('saving collection succeed');
    }).catch((err) => {
      console.log(err);
    });

  }




  list_event_with_participantname(name) {
    this.participant_query_name$.next(name);
  }

  login() {
    this.userAuthService.login();
  }

  logout() {
    this.userAuthService.logout();
  }

}
