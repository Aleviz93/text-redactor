import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-menu-formatt',
  templateUrl: './menu-for-formatt.component.html',
  styleUrls: ['./menu-for-formatt.component.scss']
})
export class MenuForFormattComponent {
  @Output() setMenu: EventEmitter<any> = new EventEmitter();

  setFormatt(atrr) {
    this.setMenu.emit(atrr);
  }
}
