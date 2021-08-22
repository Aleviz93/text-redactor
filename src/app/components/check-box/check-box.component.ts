import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.scss']
})
export class CheckBoxComponent implements OnInit {
  @Input() check: boolean;
  @Input() color: string;
  @Output() checkEmit: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    if (this.color === undefined) {
      this.color = 'gray';
    }

  }

  toggleCheck(e): void {
    this.check = !this.check;
    this.checkEmit.emit(this.check);
  }
}
