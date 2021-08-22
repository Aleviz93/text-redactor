import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  question = {
    question_id: 0,
    id: 1,
    title: 'Текстовый редактор',
    contents: [],
    status: '',
  };
  
  constructor() {
  }
}
