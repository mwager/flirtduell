import { User } from './../../providers/user/user';
// import { ChatPage } from './../chat/chat';
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

  isDebugDisplayed = true;
  dbDebugItems = [];

  loadProgress = 0;
  clearProgress: any;

  constructor(
    private userService: User,
    private zone: NgZone,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    navParams: NavParams,
    items: Items,
    public applicationRef: ApplicationRef
  ) {
    this.enemyUser = navParams.get('item'); // || items.defaultItem;
    this.score = {
      correctCount: 0
    };
  }

  startNewGame() {
    this.userService.clearDatabase()
    .then(() => {
      this.dbDebugItems = [];

      this.score = {
        correctCount: 0
      };
      this.enemyScore = null;
      this.selectedCategory = null;
      this.question = null;
      this.index = 0;
      this.loadProgress = 100;

      this.applicationRef.tick();
    });
  }

  startChat() {
    this.navCtrl.push('ChatPage');

    // tell the other user that chat was started!
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    db.collection('flirtduell')
    .doc('quiz')
    .set({chatStarted: true, uid: user.uid});
  }

  ionViewDidLoad() {
    this.startSubscription();
  }

  private startSubscription() {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (user && (user.uid === 'I6l5qjt6NQWeRGmAYYEbCM2Zl8H3')) {
      this.isAlice = true;
    }
    else {
      this.isBob = true;
    }

    this.unsubscribeQuiz = db.collection('flirtduell')
    .doc('quiz')
    .onSnapshot((res) => {
      const data = res.data();

      if (!data) {
        return;
      }

      // // we log all to the view for debugging
      // this.dbDebugItems.push(this.userService.users[data.uid] + ': ' + JSON.stringify(data));

      // wenn der datensatz von nem anderen user kommt
      if (user.uid !== data.uid) {
        console.log("GOT quiz score FROM USER ID! ", data.uid, data);

        this.zone.run(() => {
          if (data.chatStarted) { // other user started the chat
            this.navCtrl.push('ChatPage');
          }
          else if (data.categorySelected) { // alice has selected a category, means bob can play now
            this.selectedCategory = data.categorySelected;
            this.setFirstQuestion();
            this.startQuestionProgress();
          }
          else {
            this.enemyScore = data;
          }
        });
      }
    });
  }

  ionViewWillLeave() {
    if (this.unsubscribeQuiz) {
      this.unsubscribeQuiz();
    }
  }

  categorySelected(cat) {
    this.selectedCategory = cat;
    this.setFirstQuestion();

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    db.collection('flirtduell')
    .doc('quiz')
    .set({categorySelected: cat, uid: user.uid});

    this.startQuestionProgress();
  }

  setFirstQuestion() {
    this.question = questionnaire[this.selectedCategory].question1;
    this.answers = questionnaire[this.selectedCategory].answers1;

    this.applicationRef.tick();
  }

  selectAnswer(answer) {
    if (this.clearProgress) {
      window.clearInterval(this.clearProgress);
      this.loadProgress = 100;
    }

    let message;
    if (answer.isCorrect) {
      this.score.correctCount++;

      message = 'Correct!';
    }
    else if(answer.timeDone) {
      message = 'Time over! Correct would be ' + this.answers.find((a) => a.isCorrect).text;
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

      this.startQuestionProgress();
    }
    else if (this.index === 2) {
      this.question = questionnaire[this.selectedCategory].question3;
      this.answers = questionnaire[this.selectedCategory].answers3;

      this.startQuestionProgress();
    }
    else {
      this.question = null; // display score

      // send score
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;

      this.score.uid = user.uid;

      db.collection('flirtduell')
      .doc('quiz')
      .set(this.score);
    }
  }

  startQuestionProgress() {
    this.loadProgress = 100;

    this.clearProgress = window.setInterval(() => {
      this.loadProgress -= 1;

      if (this.loadProgress === 0) {
        this.selectAnswer({timeDone: true});
      }
    }, 100);
  }

}
