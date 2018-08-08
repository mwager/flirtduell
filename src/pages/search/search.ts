import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers';
declare var firebase;

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  currentItems: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public items: Items) {
    const user = firebase.auth().currentUser;

    if (!user) {
      return;
    }

    // if we are alice, insert bob and ViceVersa
    if (user && (user.uid === 'nHrzjWOGvDM2QeXjUTOZVsXLnJ82')) {
      this.currentItems=[{
        "name": "Bob",
        "profilePic": "assets/img/speakers/bob.png",
        isReal: true
      }]
    }

    if (user && (user.uid === 'uUiwVTzQ5RMJca9s4x7eHK0XLbC3')) {
      this.currentItems=[{
        "name": "Alice",
        "profilePic": "assets/img/speakers/alice.png",
        isReal: true
      }]
    }
  }

  /**
   * Navigate to the detail page for this item.
   */
  startQuiz(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }

}
