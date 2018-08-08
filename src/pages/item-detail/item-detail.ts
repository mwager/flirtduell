import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

import { Items } from '../../providers';

// more? https://quizduell-antworten.de.tl/Comics.htm
const question1 = 'In welcher Serie versuchen 2 Labormäuse jede Nacht die Weltherrschaft zu übernehmen, was letztlich doch immer scheitert?';
const answers1 = [
  {text: 'Labmice', isCorrect: false},
  {text: 'Mouse X & Z', isCorrect: false},
  {text: 'Dexters Labor', isCorrect: false},
  {text: 'Pinky und der Brain', isCorrect: true}
];

const question2 = 'Aus welchem Land kommen Manga-Comics?';
const answers2 = [
  {text: 'Australien', isCorrect: false},
  {text: 'China', isCorrect: false},
  {text: 'Japan', isCorrect: true},
  {text: 'Deutschland', isCorrect: false}
];

const question3 = 'Wann treten die Superkräfte der Mutanten in X-Men überwiegend auf?';
const answers3 = [
  {text: 'Während sie Sex haben', isCorrect: false},
  {text: 'Am Abend', isCorrect: false},
  {text: 'Beim Mittagessen', isCorrect: false},
  {text: 'In der Pubertät', isCorrect: true}
];

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  enemyUser: any;
  question: any;
  answers: any;
  index = 0;
  enemyScore: any;
  score = {
    correctCount: 0
  };
  unsubscribeQuiz: any;

  isAlice = false;
  isBob = false

  constructor(private zone: NgZone, public toastCtrl: ToastController, public navCtrl: NavController, navParams: NavParams, items: Items) {
    this.enemyUser = navParams.get('item'); // || items.defaultItem;

    this.question = question1;
    this.answers = answers1;
  }

  startNewGame() {
    this.score = {};
    this.enemyScore = {};
    this.question = question1;
    this.answers = answers1;
    this.index = 0;
  }

  ionViewDidLoad() {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (user && (user.uid === 'nHrzjWOGvDM2QeXjUTOZVsXLnJ82')) {
      this.isAlice = true;
    }
    else {
      this.isBob = true;
    }

    this.unsubscribeQuiz = db.collection("quiz")
    .onSnapshot((res) => {
      res.docs.forEach((doc) => {

        console.log(doc.data());

        if (user.uid !== doc.id) {
          console.log("GOT quiz score FROM USER ID! ", doc.id, doc.data());

          this.zone.run(() => {
            this.enemyScore = doc.data();
          });
        }
      });
    });
  }

  ionViewWillLeave() {
    if (this.unsubscribeQuiz) {
      this.unsubscribeQuiz();
    }
  }

  selectAnswer(answer) {
    let message;

    if (answer.isCorrect) {
      this.score.correctCount++;

      message = 'Correct!';
    }
    else {
      message = 'Wrong answer! Correct would be ' + this.answers.find((a) => a.isCorrect).text;
    }

    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();

    this.index++;

    if (this.index === 1) {
      this.question = question2;
      this.answers = answers2;
    }
    else if (this.index === 2) {
      this.question = question3;
      this.answers = answers3;
    }
    else {
      this.question = null; // display score

      // send score
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;

      db.collection("quiz").doc(user.uid)
      .set(this.score);
    }
  }
}
