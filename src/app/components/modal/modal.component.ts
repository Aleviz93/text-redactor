import { Component, OnInit, OnDestroy, ElementRef, Input } from '@angular/core';
import { ModalService } from 'src/app/service/modal.service';

@Component({
  selector: 'app-custom-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() position: any;
  private element: any;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = this.el.nativeElement;
  }

  ngOnInit(): void {
    const modal = this;
    if (!this.id) {
      console.error('modal must have an id');
      return;
    }
    document.body.appendChild(this.element);
    this.element.addEventListener('click', (e: any) => {
      if (e.target.className === 'custom-modal') {
        modal.close();
      }
    });
    this.modalService.add(this);
  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  open(): void {
    this.element.style.display = 'block';
    const scrollWidth = Math.max(
      document.body.offsetWidth, document.documentElement.offsetWidth,
      document.body.clientWidth, document.documentElement.clientWidth
    );

    const scrollHeight = Math.max(
      document.body.clientHeight, document.documentElement.clientHeight
    );

    const body = document.getElementById(this.id + '-body');

    if (this.position.y + body.offsetHeight < scrollHeight) {
      body.style.top = (this.position.y - body.offsetHeight - 16) + 'px';
      body.style.bottom = 'auto';
    } else {
      body.style.top = 'auto';
      body.style.bottom = '5px';
    }

    if (this.position.x + body.offsetWidth < scrollWidth) {
      body.style.left = this.position.x + 'px';
      body.style.right = 'auto';
    } else {
      body.style.left = 'auto';
      body.style.right = '5px';
    }

    setTimeout(() => {
      this.element.classList.add('show');
      document.body.classList.add('custom-modal-open');
    }, 200);
  }

  close(): void {
    this.element.style.display = 'none';
    this.element.classList.remove('show');
    document.body.classList.remove('custom-modal-open');
  }
}
