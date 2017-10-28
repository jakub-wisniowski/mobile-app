import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BackendService } from '../../services/backend.service';
import { LoginService } from '../../services/login.service';
import { UserService } from '../../services/user.service';
import { GoodbyeComponent } from '../goodbye/view-goodbye.component';
import { Lesson } from '../../models/lesson';
import { Word } from '../../models/word';

@Component({
  selector: 'dashboard',
  templateUrl: 'view-dashboard.component.html'
})

export class DashboardComponent {
  //tablica zawierajaca tylko slowka pozostale do nauki
  words: Word[];
  //talica zawierająca wszystkie slowka studenta
  allWords: Word[];
  options: Word[];
  wordToGuess: Word;
  response: string;
  ok: boolean;
  wordsReady: boolean;
  user: string;
  clicked: boolean;
  chosenLesson: Lesson;
  mode: number;
  constructor(
    private _backendService: BackendService,
    private _loginService: LoginService,
    private _userService: UserService,
    public _navCtrl: NavController) {
    this.response = null;
    this.ok = null;
    this.wordsReady = false;
    this.clicked = false;
    this.allWords=[];
    this.words=[];
    this.mode = this._userService.getMode();
    this.chosenLesson = this._userService.getLesson();
    this._backendService.getLessonsWords(this.chosenLesson.id).subscribe(
      data => {
        this.allWords = data;
        this.words = this.allWords.concat();
        this._backendService.getAllGuessed(this._loginService.getUserID()).subscribe(guessed => {
          if (guessed != null) {
            for (var i = 0; i < guessed.length; i++) {
              for (var j = 0; j < this.words.length; j++) {
                if (this.words[j].id == guessed[i].wordID) {
                  this.words.splice(j, 1); break;
                }
              }
            }
          }
          this.prepareOptions();
        })
      }
    )
    //this.lessonsFiltered=this.lessons.filter((l:word) => l.lesson===this.chosenLesson);
  }
  prepareOptions() {
    this.options = [];
    var length = this.allWords.length;
    console.log(this.allWords);
    //rand to index wylosowanego slowa do odgadnięcia
    var rand = Math.floor(Math.random() * this.words.length);

    //how_far mówi o ile wyrazów w lewo lub w prawo od wybranego slowa się przesuniemy
    var how_far = Math.floor(Math.random() * 4);
    this.wordToGuess = this.words[rand];
    var j = 0;
    if (rand + how_far >= length) {
      for (var i = 0; i <= rand + how_far - length; i++) {
        this.options[j] = this.allWords[i];
        j++;
      }
      for (var i = rand - (3 - how_far); i < length; i++) {
        this.options[j] = this.allWords[i];
        j++;
      }
    }
    else if (rand - (3 - how_far) < 0) {
      for (var i = length + rand - (3 - how_far); i < length; i++) {
        this.options[j] = this.allWords[i];
        j++;
      }
      for (var i = 0; i < rand + how_far; i++) {
        this.options[j] = this.allWords[i];
        j++;
      }
      if (rand == 0 || how_far == 0) this.options[j] = this.words[rand];
    }
    else {
      for (var i = rand - (3 - how_far); i <= rand + how_far; i++) {
        this.options[j] = this.allWords[i];
        j++;
      }

    }
    this.wordsReady = true;
  }
  assign(x: string) {
    if (!this.clicked) {
      this.clicked = true;
      this.response = x;
      this.ok = this.response == this.wordToGuess.polish ? true : false;
    }
  }
  swipeEvent(e) {
    if (e.direction == '2') {
      this.nextword();
    }
  }
  nextword() {
    var userID = this._loginService.getUserID();

    if (this.clicked) {
      this._backendService.addOrUpdateStudentWord(this.ok, userID, this.wordToGuess.id).subscribe(data => {
        this._backendService.getAllGuessed(this._loginService.getUserID()).subscribe(guessed => {
          if (guessed != null) {
            for (var i = 0; i < guessed.length; i++) {
              for (var j = 0; j < this.words.length; j++) {
                if (this.words[j].id == guessed[i].wordID) {
                  this.words.splice(j, 1); break;
                }
              }
            }
          }
          this.clicked = false;
          this.prepareOptions();
          this.response = null;
          this.ok = null;
        })
      })
    }
  }
  logout() {
    this._navCtrl.push(GoodbyeComponent);
  }
}
