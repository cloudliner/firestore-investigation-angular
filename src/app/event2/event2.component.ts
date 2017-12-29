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

interface SearchList<T> extends Observable<T[]> {
  find(id: string): T;
}

// users
interface User {
  name: string;
}
interface UserWithId extends User {
  id: string;
}

// groups
interface Group {
  name: string;
}
interface GroupWithId extends Group {
  id: string;
}

// events
interface UserParticipate {
  [key: string]: Date;
}
interface EventInfo {
  event_date: Date;
  group_id: string;
  group_name$: Observable<Group>;
  group_id_date: {[key: string]: Date};
  title: string;
}
interface EventItem {
  created_by: string;
  created_by_name$: Observable<User>;
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
  user_list$: Observable<UserWithId[]> = this.userCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
      const data = a.payload.doc.data() as User;
      const id = a.payload.doc.id;
      return { id, ...data };
    })
  }) as SearchList<UserWithId>;

  groupCollection: AngularFirestoreCollection<Group> = this.afs.collection('groups');
  group_list$: Observable<GroupWithId[]> = this.groupCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
      const data = a.payload.doc.data() as Group;
      const id = a.payload.doc.id;
      return { id, ...data };
    })
  });

  // for test
  test_user$ = this.find_user('23DN4H9GpU2fUFHWWvUX');

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
        data.created_by_name$ = this.find_user(data.created_by);
        data.info.group_name$ = this.find_group(data.info.group_id);
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

  filter_event(user_filter: string, group_filter: string, date_filter: string, time_filter: string) {

    this.group_name_query$.next(group_filter);
    this.userid_query$.next(user_filter);

    let event_date_filter = null;
    if (date_filter && time_filter) {
      event_date_filter = new Date(date_filter + ' ' + time_filter);
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
    this.userCollection.add({name: user_name});
  }

  create_group(group_name: string) {
    this.groupCollection.add({name: group_name});
  }

  create_new_event(event_name: string, owner_id: string, group_id: string, event_date: string, event_time: string) {
    const event_date_time = new Date(event_date + ' ' + event_time);
    const group_date = {};
    group_date[group_id] = event_date_time;
    const own_participate_data = {};
    own_participate_data[owner_id] = event_date_time;
    const own_admin = {};
    own_admin[owner_id] = true;

    const event_data: EventItem = {
      created_by: owner_id,
      created_by_name$: this.find_user(owner_id);
      admin: own_admin,
      info: {
        event_date: event_date_time,
        group_id: group_id,
        group_name$: this.find_group(group_id),
        group_id_date: group_date,
        title: event_name
      },
      participats: own_participate_data
    };
    this.event_itemsCollection.add(event_data).then(() => {
      console.log('event created');
    }).catch((err) => {
      console.log('errror', err);
    });
  }

  find_user(id: string): Observable<User> {
    let user: Observable<User> = this.afs.doc<User>('users/' + id).valueChanges();
    return user;
  }

  find_group(id: string): Observable<Group> {
    let group: Observable<Group> = this.afs.doc<Group>('groups/' + id).valueChanges();
    return group;
  }

  test() {
    let temp_user:Observable<User> = this.find_user('23DN4H9GpU2fUFHWWvUX');
    console.log(temp_user);
    console.log(temp_user['name']);
  }
}
