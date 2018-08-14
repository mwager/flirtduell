import { Component, NgZone, ApplicationRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

import { Items } from '../../providers';
declare var firebase;

// more? https://quizduell-antworten.de.tl/
const questionnaire = {
  'comics': {
    question1: 'In welcher Serie versuchen 2 Labormäuse jede Nacht die Weltherrschaft zu übernehmen, was letztlich doch immer scheitert?',
    answers1: [
      {text: 'Labmice', isCorrect: false},
      {text: 'Mouse X & Z', isCorrect: false},
      {text: 'Dexters Labor', isCorrect: false},
      {text: 'Pinky und der Brain', isCorrect: true}
    ],

    question2: 'Aus welchem Land kommen Manga-Comics?',
    answers2: [
      {text: 'Australien', isCorrect: false},
      {text: 'China', isCorrect: false},
      {text: 'Japan', isCorrect: true},
      {text: 'Deutschland', isCorrect: false}
    ],

    question3: 'Wann treten die Superkräfte der Mutanten in X-Men überwiegend auf?',
    answers3: [
      {text: 'Während sie Sex haben', isCorrect: false},
      {text: 'Am Abend', isCorrect: false},
      {text: 'Beim Mittagessen', isCorrect: false},
      {text: 'In der Pubertät', isCorrect: true}
    ]
  },
  'computergames': {
    question1: 'Was erscheint, wenn man einen zusätzlichen Lebenspilz bei Super Mario Bros. nimmt?',
    answers1: [
      {text: 'Eine Mariofigur', isCorrect: false},
      {text: 'Ein Stern', isCorrect: false},
      {text: 'Ein Ballon', isCorrect: false},
      {text: '1 up', isCorrect: true}
    ],
    question2: 'Was haben die Spiele "Wolfenstein 3D", "Quake" und "Hexen" gemeinsam?',
    answers2: [
      {text: 'Denkspiele', isCorrect: false},
      {text: 'Es geht um töten', isCorrect: false},
      {text: 'Ego-Shooter-Spiele', isCorrect: true},
      {text: 'Jump\'n\'run Spiele', isCorrect: false}
    ],

    question3: 'Welche Firma entwickelte "Diablo 3"?',
    answers3: [
      {text: 'Microsoft', isCorrect: false},
      {text: 'Apple', isCorrect: false},
      {text: 'Oracle', isCorrect: false},
      {text: 'Blizzard', isCorrect: true}
    ]
  },
  'food': {
    question1: 'Auf welchem biotechnologischen Verfahren basiert das Erfrischungsgetränk "Bionade"?',
    answers1: [
      {text: 'Trocknen', isCorrect: false},
      {text: 'Erhitzen', isCorrect: false},
      {text: 'Kochen', isCorrect: false},
      {text: 'Fermentation', isCorrect: true}
    ],
    question2: 'Aus welchem Land kommt das Bier "Corona"?',
    answers2: [
      {text: 'USA', isCorrect: false},
      {text: 'Spanien', isCorrect: false},
      {text: 'Mexiko', isCorrect: true},
      {text: 'England', isCorrect: false}
    ],

    question3: 'Aus welchem Land kommt das Gericht "Nasi Goreng"?',
    answers3: [
      {text: 'Deutschland', isCorrect: false},
      {text: 'Thailand', isCorrect: false},
      {text: 'Portugal', isCorrect: false},
      {text: 'Indonesien', isCorrect: true}
    ]
  }
}

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  enemyUser: any;
  question: any = null;
  answers: any;
  index = 0;
  enemyScore: any;
  score: any;
  unsubscribeQuiz: any;
  selectedCategory: any = null;

  isAlice = false;
  isBob = false

  constructor(private zone: NgZone, public toastCtrl: ToastController, public navCtrl: NavController, navParams: NavParams, items: Items, public applicationRef: ApplicationRef) {
    this.enemyUser = navParams.get('item'); // || items.defaultItem;
    this.score = {
      correctCount: 0
    };
  }

  startNewGame() {
    this.score = {
      correctCount: 0
    };
    this.enemyScore = {};
    this.selectedCategory = null;
    this.question = null;
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

  categorySelected(cat) {
    this.selectedCategory = cat;

    this.question = questionnaire[this.selectedCategory].question1;
    this.answers = questionnaire[this.selectedCategory].answers1;

    this.applicationRef.tick()
    console.log("this.question", this.question);
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
      this.question = questionnaire[this.selectedCategory].question2;
      this.answers = questionnaire[this.selectedCategory].answers2;
    }
    else if (this.index === 2) {
      this.question = questionnaire[this.selectedCategory].question3;
      this.answers = questionnaire[this.selectedCategory].answers3;
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
