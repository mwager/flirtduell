import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';

import { Api } from '../api/api';
declare var firebase;

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }Ø
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class User {
  _user: any;

  users = {
    'I6l5qjt6NQWeRGmAYYEbCM2Zl8H3': 'Alice',
    '9kfj0hzJV7OXBjZx4CZilGnld7R2': 'Bob'
  }

  constructor(public api: Api) { }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(accountInfo.email, accountInfo.password)
      .then((res) => {
        this._loggedIn(res);
        resolve();
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.error("?", error)
        reject(error);
      });

      // firebase.auth().createUserWithEmailAndPassword('bob@mwager.de', '123456')
      // .catch(function(error) {
      //   // Handle Errors here.
      //   var errorCode = error.code;
      //   var errorMessage = error.message;
      //   // ...
      //   console.error("?", error)
      //   reject(error)
      // });
    });
  }

  clearDatabase() {
    const db = firebase.firestore();
    // const promises = []
    const ps = [];

    // we only have ONE collection with docs for "likes", "quiz" and "chats"

    ps.push(
      db.collection('flirtduell').doc('likes').delete()
    )
    ps.push(
      db.collection('flirtduell').doc('quiz').delete()
    )
    ps.push(
      db.collection('flirtduell').doc('chats').delete()
    )

    // ps.push(
    //   db.collection('flirtduell').get()
    //   .then((docs) => {
    //     docs.forEach((doc) => {
    //       promises.push(
    //         db.collection('flirtduell')
    //         .doc(doc.id)
    //         .delete()
    //       )
    //     });

    //     return Promise.all(promises)
    //   })
    // )

    return Promise.all(ps)
    .then(() => {
      console.log('DB DROPPED');
    });
  }


  // profilePic(userId) {
  //   if (!this._user) {
  //     return null;
  //   }

  //   if (!userId === 'nHrzjWOGvDM2QeXjUTOZVsXLnJ82') { // alice
  //     return 'assets/img/speakers/alice.png';
  //   }
  //   if (!userId === 'uUiwVTzQ5RMJca9s4x7eHK0XLbC3') { // bob
  //     return 'assets/img/speakers/bob.png';
  //   }
  // }













  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
    let seq = this.api.post('signup', accountInfo).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this._user = null;
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
  }
}
