import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
*/
@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  deferredPrompt: any;
  showBtn = false;

  constructor(public navCtrl: NavController) { }

  login() {
    this.navCtrl.push('LoginPage');
  }

  signup() {
    this.navCtrl.push('SignupPage');
  }

  // ionViewWillEnter(){
  //   window.addEventListener('beforeinstallprompt', (e) => {
  //     // Prevent Chrome 67 and earlier from automatically showing the prompt
  //     e.preventDefault();
  //     // Stash the event so it can be triggered later on the button event.
  //     this.deferredPrompt = e;

  //     // Update UI by showing a button to notify the user they can add to home screen
  //     this.showBtn = true;
  //   });

  //   // button click event to show the promt
  //   window.addEventListener('appinstalled', (event) => {
  //    alert('app is installed');
  //   });

  //   if (window.matchMedia('(display-mode: standalone)').matches) {
  //     alert('display-mode is standalone');
  //   }
  // }

  // addToHome(e){
  //   // hide our user interface that shows our button
  //   // Show the prompt
  //   this.deferredPrompt.prompt();
  //   // Wait for the user to respond to the prompt
  //   this.deferredPrompt.userChoice
  //     .then((choiceResult) => {
  //       if (choiceResult.outcome === 'accepted') {
  //         alert('User accepted the prompt');
  //       } else {
  //         alert('User dismissed the prompt');
  //       }
  //       this.deferredPrompt = null;
  //     });
  // }

}
