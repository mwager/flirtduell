import { Component, ViewChild, ApplicationRef } from '@angular/core';
import { IonicPage, NavController, Content } from 'ionic-angular';
declare var firebase;

const ROOM_KEY = 'chats';

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {
  message = '';
  messages = [];

  unsubscribeChat: any;
  isAlice : boolean;
  isBob : boolean;
  userName: any;
  chatUser: any;
  profilePic: any; // of chat partner

  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public applicationRef: ApplicationRef) { }

  sendMessage(e) {
    if (!this.message) {
      return;
    }

    const db = firebase.firestore();

    db.collection('flirtduell')
    .doc(ROOM_KEY)
    .set({
      date: new Date().getTime(),
      user: this.userName,
      message: this.message
    });

    this.message = '';
  }

  ionViewDidLoad() {
    this.startSubscription();
  }

  ionViewWillLeave() {
    if (this.unsubscribeChat) {
      this.unsubscribeChat();
    }
  }

  private startSubscription() {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (user && (user.uid === 'nHrzjWOGvDM2QeXjUTOZVsXLnJ82')) {
      this.isAlice = true;
      this.userName = 'Alice';
      this.chatUser = 'Bob';
      this.profilePic = "assets/img/speakers/bob.png";
    }
    else {
      this.isBob = true;
      this.userName = 'Bob';
      this.chatUser = 'Alice';
      this.profilePic = "assets/img/speakers/alice.png";
    }

    this.unsubscribeChat = db.collection('flirtduell')
    .doc(ROOM_KEY)
    .onSnapshot((res) => {
      const data = res.data();

      if (!data) {
        return;
      }

      this.messages.push(data);
      this.applicationRef.tick();

      setTimeout(() => {
        if (this.content) {
          this.content.scrollToBottom(300);
        }
      }, 250);
    });
  }
}
