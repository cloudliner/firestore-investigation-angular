import { Component, OnInit } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/combineLatest';

import { UserAuthService } from './../user-auth.service';

// https://github.com/ReactiveX/rxjs/issues/1694


/*

{
  created_by:userid
  admin - only admin can edit
  {
    userid:true
    userid:true
  }
  info: only admin can add and edit
  {
    event_day:Date  - used for query
    group: Date    - used for query
    group_name: string
    title: string
  }
  invited:
  {
    userid:invite

  }
  team:  only for written debate's team
  {
    userid: teamname
    userid: teamname
  }
  participate: only user can edit , used for th e purpose of query
  {
    userid:Date || null
    userid:Date
  }
}

*/

interface User {
  name: string;
}

interface UserWithId extends User {
  id: string;
}

interface UserParticipate {
  [key: string]: Date;
}
interface EventInfo {
  event_date: Date;
  group_id: string;
  group_id_date: {[key: string]: Date};
  title: string;
}

interface EventItem {
  created_by: string;
  admin: {[key: string]: boolean};
  info: EventInfo;
  participats?: UserParticipate;
}

interface EventItemWithId extends EventItem {
  id: string;
  participant_arr: string[];
}

const GROUP_NAME = ['AAA', 'BBB', 'CCC'];

@Component({
  selector: 'app-event2',
  templateUrl: './event2.component.html',
  styleUrls: ['./event2.component.css']
})
export class Event2Component implements OnInit {

  constructor( private afs: AngularFirestore,
              private userAuthService: UserAuthService ) { }

  group_name_query$: BehaviorSubject<string> = new BehaviorSubject('');
  userid_query$: BehaviorSubject<string>  = new BehaviorSubject('');
  event_date_query$: BehaviorSubject<Date | null> = new BehaviorSubject(null);
  event_list$: Observable<EventItemWithId[]>;

  event_itemsCollection = this.afs.collection<EventItem>('event_related-event2');

  userCollection: AngularFirestoreCollection<User> = this.afs.collection('users');
  user_list: Observable<UserWithId[]> = this.userCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
      const data = a.payload.doc.data() as User;
      const id = a.payload.doc.id;
      return { id, ...data };
    })
  });

  ngOnInit() {

  // all event
    // (0) 全部のイベントを時間純に並べる
  // user related
    // (1) userを指定し、招待されたり、参加済みの eventを時間順に並べる
    // (2) userを指定し、userの所属する複数のグループのイベントを並べる
    // (3) userが参加した、過去のイベントも含めて全て並べる
  // group related
    // (4) groupを指定し、eventを時間で並べる
    // (5) groupを指定し、eventの時間でならべつつ、ユーザのIDがマッチするものを探す
    // (6) groupを指定し、過去のものも含めて全てのイベントを並べる

    // const combined = Observable.combineLatest(this.group_name_query$, this.userid_query$ );


    const combined = Observable.combineLatest(this.group_name_query$, this.userid_query$, this.event_date_query$);

    this.event_list$ =
    combined.switchMap(([group_id, userid, event_date ]) => {
      if (group_id && !event_date) {
        return this.afs.collection<EventItem>('event_related-event2', (ref) => {
          return ref.where('info.group_id', '==', group_id);
        }).snapshotChanges();
      }else {
        return this.afs.collection<EventItem>('event_related-event2').snapshotChanges();
      }
    }).map(actions => {
      return actions.map( (a) => {
        const type = a.type;
        const data = a.payload.doc.data() as EventItem;
        const id = a.payload.doc.id;
        return {id, ...data};
      });
    })
    .map((data: EventItemWithId[]) => {
      return data.map((event_item: EventItemWithId) => {
        const participant_obj = event_item.participats;
        const participant_arr: string[] = [];
        for (const key in participant_obj) {
          participant_arr.push(key);
        }
        return Object.assign(event_item, {participant_arr});
      });
    });

  }
  create_event(title: string, group_id: string = 'aaa', date_num: number = 1) {
    const own_user_id = this.userAuthService.get_own_id();
    if (!own_user_id) {
      return;
    }

    const event_date = new Date(Date.now() + date_num * 1000 * 60 * 60 * 24);

    const group_date = {};
    group_date[group_id] = event_date;
    const own_participate_data = {};
    own_participate_data[own_user_id] = event_date;
    const own_admin = {};
    own_admin[own_user_id] = true;

    const event_data: EventItem = {
      created_by: own_user_id,
      admin: own_admin,
      info: {
        event_date: event_date,
        group_id: group_id,
        group_id_date: group_date,
        title: title
      },
      participats: own_participate_data
    };
    this.event_itemsCollection.add(event_data).then(() => {
      console.log('event created');
    }).catch((err) => {
      console.log('errror', err);
    });
  }

  edit_event() {

  }
  add_participant(event_id) {
    console.log('add participant');
  }

  join_event() {

  }


  query_by_grouop(group_id) {

  }
  query_by_user(userid) {

  }

  filter_event(userid_filter: string, group_id_filter: string, number_filter: number ) {

    this.group_name_query$.next(group_id_filter);
    this.userid_query$.next(userid_filter);

    let event_date_filter = null;
    if (number_filter) {
      event_date_filter = new Date(Date.now() + number_filter * 1000 * 60 * 60 * 24);
    }
    this.event_date_query$.next(event_date_filter);

  }


  login() {
    this.userAuthService.login();
  }

  logout() {
    this.userAuthService.logout();
  }

  create_user(user_name: string) {
    let user_colection = this.afs.collection<User>('users');
    user_colection.add({name: user_name});
  }
}
