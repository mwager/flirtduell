import { User } from './../../providers/user/user';
import { SearchPage } from './../search/search';
import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, AlertController, ToastController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers';
declare var firebase;

const users = {
  nHrzjWOGvDM2QeXjUTOZVsXLnJ82: 'Alice',
  uUiwVTzQ5RMJca9s4x7eHK0XLbC3: 'Bob'
}

@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage {
  currentItems: Item[];
  unsubscribeLikes: any;
  likeLength = 0;

  constructor(
    // private userService: User,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public items: Items,
    public modalCtrl: ModalController
  ) {
    this.currentItems = this.items.query();
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
    const user = firebase.auth().currentUser;

    if (!user) {
      return;
    }

    // if we are alice, insert bob and ViceVersa
    if (user && (user.uid === 'nHrzjWOGvDM2QeXjUTOZVsXLnJ82')) {
      this.currentItems.splice(2, 0, {
        "name": "Bob",
        "profilePic": "assets/img/speakers/bob.png",
        isReal: true
      })
    }

    if (user && (user.uid === 'uUiwVTzQ5RMJca9s4x7eHK0XLbC3')) {
      this.currentItems.splice(2, 0, {
        "name": "Alice",
        "profilePic": "assets/img/speakers/alice.png",
        isReal: true
      })
    }

    const handler = (ev) => {
      this.animationdone(ev)
    };
    document.body.addEventListener(
      'animationend', handler
    );

    const db = firebase.firestore();
    this.unsubscribeLikes = db.collection('flirtduell')
    .doc('likes')
    .onSnapshot((doc) => {
      const user = firebase.auth().currentUser;
      const data = doc.data();
      console.log("data", data);

      if (!data) {
        return;
      }

      if (data) {
        this.likeLength++;

        if (this.likeLength === 2) {
          this.displayMatchToast();
          return;
        }
      }

      if (data && data.uid !== user.uid) {
        let toast = this.toastCtrl.create({
          message: 'You\'ve got a like from ' + data.fromUserName,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      }
    });
  }

  ionViewWillLeave() {
    if (this.unsubscribeLikes) {
      this.unsubscribeLikes();
    }

    try {
      document.body.removeEventListener(
        'animationend', () => {}
      );
    }
    catch(e) {}
  }

  swipeEvent(event) {
    if (event.direction === 2) { // left
      this.swipeLeft();
    }
    else if (event.direction === 4) { // right
      this.swipeRight();
    }
  }

  swipeLeft() {
    document.querySelector('.cardcontainer').classList.add('nope');
  }

  swipeRight() {
    document.querySelector('.cardcontainer').classList.add('yes');
  }

  animationdone(ev) {
    // get the container
    var origin = document.querySelector('.cardcontainer'); // ev.target.parentNode.parentNode;

    // remove the appropriate class
    // depending on the animation name
    if (ev.animationName === 'yay') {
      origin.classList.remove('yes');
    }
    if (ev.animationName === 'nope') {
      origin.classList.remove('nope');
    }

    // if any of the card events have
    // ended…
    if (ev.animationName === 'nope' ||
        ev.animationName === 'yay') {

      // remove the first card in the element
      const curr = origin.querySelector('.current');
      const isReal = curr.classList.contains('isreal');

      curr.remove();

      // if there are no cards left, do nothing
      if (!origin.querySelector('.mycard')) {
        // no more cards left -
        // TODO other functionality
        console.log("NO MORE CARDS LEFT")

      } else {
        // otherwise shift the 'current' class to
        // the next card
        origin.querySelector('.mycard')
        .classList
        .add('current');

        if (isReal)
          this.sendLike();
      }
    }
  }

  sendLike() {
    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    db.collection("flirtduell")
    .doc('likes')
    .set({
      fromUserName: users[user.uid],
      email: user.email,
      uid: user.uid
    });

    console.log('Like sent! from', user.email);
  }

  displayMatchToast() {
    let name;
    const user = firebase.auth().currentUser;

    if (user && (user.uid === 'nHrzjWOGvDM2QeXjUTOZVsXLnJ82')) {
      name = 'Bob'
    }
    else {
      name = 'Alice'
    }

    let ctrl = this.alertCtrl.create({
      title: 'New Match!',
      subTitle: 'You got a new match with ' + name,
      buttons: [
        {
          text: 'Keep playing',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },

        {
          text: 'Start quiz',
          handler: data => {
            this.navCtrl.parent.select(1);
            // ctrl.dismiss()
            // .then(() => {

            // })
          }
        }
      ]
    });
    ctrl.present();
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
      if (item) {
        this.items.add(item);
      }
    })
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    this.items.delete(item);
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }
}
