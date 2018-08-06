import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage {
  currentItems: Item[];

  constructor(public navCtrl: NavController, public items: Items, public modalCtrl: ModalController) {
    this.currentItems = this.items.query();

    document.body.addEventListener(
      'animationend', this.animationdone
    );
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
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
    var origin = ev.target.parentNode.parentNode;

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
      origin.querySelector('.current').remove();

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
      }
    }
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
