// текстовый редактор работает по принципу блоков
// каждый абзац / текст/ список / чекбокс это отдельный блок
// применение стилей работает к блоку что помогает разграничить облась действия бокового меню

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ModalService } from 'src/app/service/modal.service';

@Component({
  selector: 'app-text-redactor',
  templateUrl: './text-redactor.component.html',
  styleUrls: ['./text-redactor.component.scss']
})
export class TextRedactorComponent implements OnInit {
  @Input() question: any;
  @Output() content: EventEmitter<any> = new EventEmitter();

  questionForSave: any;
  editableElement: HTMLElement;
  selectContent: any;
  selection: any;

  timeOutInput: any;
  keyboardTimeOut: any;
  
  modals = {
    formatt: {
      x: 0,
      y: 0
    },
    users: {
      x: 0,
      y: 0
    }
  };

  searchUsersInput = '';
  targetIndex: number;
  showLink = false;

  placeholder = {
    H1: 'Заголовок',
    H2: 'Заголовок',
    p: 'Введите текст',
    insertOrderedList: 'Нумерованный список',
    insertUnorderedList: 'Маркированный список',
    todo: 'Список задач',
  };

  constructor(public modalService: ModalService) {}

  // при сохранении информации онлайн 
  // курсор в блоке переставлялся в начало блока
  // для борьбы с этим сохранение дублируется в отдельную переменную questionForSave
  // откуда потом сравниваются изменения, а так же из questionForSave сохраняется на сервер
  ngOnInit(): void {
    if (this.question) {
      this.questionForSave = JSON.parse(JSON.stringify(this.question));
      if (this.question.contents.length === 0) {
        this.addBlock();
      }
    }
    else {
      this.addBlock();
    }
  }

  // переставление элемента при drag $ drop
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.question.contents, event.previousIndex, event.currentIndex);
    this.questionForSave = JSON.parse(JSON.stringify(this.question));
    this.saveChange();
  }

  // сохранение информации с задержкой с 300 мс в questionForSave
  // а так же моментальное сохрание при пустом блоке для 
  // оператвного скрытия плейсхолдера а не через 300 мс
  emitChanges(event, i): void {
    clearTimeout(this.timeOutInput);
    if (this.checkTrimContent(i) === '' || event.target.innerText.replace(/(\<(\/?[^>]+)>)/g, '').trim() === '') {
      this.questionForSave.contents[i].content = event.target.innerHTML;
      this.saveChange();
    } else {
      this.timeOutInput = setTimeout(() => {
        this.questionForSave.contents[i].content = event.target.innerHTML;
        this.saveChange();
      }, 300);
    }
  }

  saveChange(): void {
    const title = document.getElementById('title-editable').innerText;
    this.questionForSave.title = title;
    this.content.emit({ element: this.questionForSave });
  }

  // обработчик выделения текста
  selectText(): void {
    const selection = (document.getSelection() + '').trim();
    if (selection !== '') {
      this.selection = selection;
      this.showLink = false;
      this.modalService.open('format-text');
    } else {
      this.selection = undefined;
    }
  }

  // обработчик выделения текста
  slectMousePosition(e): void {
    this.modals.formatt.y = e.clientY;
    this.modals.formatt.x = e.clientX;
    this.selectText();
  }

  // функция для форматирования выделенного текста 
  setFormattText(event, attribute: 'b' | 'i' | 'link'): void {
    event.stopPropagation();
    switch (attribute) {
      case 'b':
        this.showLink = false;
        document.execCommand('bold');
        break;
      case 'i':
        this.showLink = false;
        document.execCommand('italic');
        break;
      case 'link':
        const select = document.getSelection();
        const text = document.getSelection() + '';
        const item = document.getElementById('select_for_link');
        if (item) item.removeAttribute('id');
        const range = select.getRangeAt(0);
        select.getRangeAt(0).deleteContents();
        let span = document.createElement('span');
        span.id = 'select_for_link';
        span.appendChild(document.createTextNode(text));
        range.insertNode(span);
        range.setStartAfter(span);
        this.showLink = true;
        setTimeout(() => this.setLinkPosition());
        break;
    }
  }

  // функция для форматирования выделенного блока 
  setFormattBlock(atrr, i): void {
    const documentEditable = document.getElementById('content-editable-' + i);
    documentEditable.focus();

    switch (atrr) {
      case 'H1':
      case 'H2':
      case 'p':
        documentEditable.innerHTML = documentEditable.innerText;
        document.execCommand('formatBlock', false, `<${atrr}>`);
        break;
      case 'insertOrderedList':
      case 'insertUnorderedList':
        document.execCommand(atrr);
        break;
      case 'todo':
        documentEditable.innerHTML = documentEditable.innerText;
        document.execCommand('formatBlock', false, `<p>`);
        break;
      case 'delete':
        if (this.question.contents.length > 1) {
          this.question.contents.splice(i, 1);
          this.questionForSave.contents.splice(i, 1);
          this.saveChange();
        } else {
          this.question.contents.splice(i, 1);
          const item = {
            type: 'text',
            content: '',
            checkStatus: false
          };
          this.question.contents.push(item);
          this.questionForSave.contents.push(item);
          this.saveChange();
        }
        break;
      default:
        break;
    }

    if (atrr != 'delete') {
      this.question.contents[i].type = atrr;
      this.questionForSave.contents[i].type = atrr;
    }
  }

  // подсчет позиции окна ссылки
  setLinkPosition(): void {
    let linkBlock = document.getElementById('link-block');
    let position = this.modals.formatt;

    const scrollWidth = Math.max(
      document.body.offsetWidth, document.documentElement.offsetWidth,
      document.body.clientWidth, document.documentElement.clientWidth
    );

    const scrollHeight = Math.max(
      document.body.clientHeight, document.documentElement.clientHeight
    );

    if (position.y + linkBlock.offsetHeight < scrollHeight) {
      linkBlock.style.top = '53px';
    } else {
      linkBlock.style.top = '-107px';
    }

    if (position.x + linkBlock.offsetWidth < scrollWidth) {
      linkBlock.style.left = '0';
      linkBlock.style.right = 'auto';
    } else {
      linkBlock.style.left = 'auto';
      linkBlock.style.right = '0';
    }
  }

  createLink(link): void {
    const item = document.getElementById('select_for_link');
    document.getSelection().setBaseAndExtent(item, 0, item, item.childNodes.length);
    document.execCommand('createLink', false, link.value);
    this.modalService.close('format-text');
    item.removeAttribute('id');
  }

  // функция обработки нажатий клавиш клавиатуры
  keyboardKeyListenner(e): void {
    if (this.searchUsersInput !== '') {
      if (e.keyCode !== 8) {
        this.searchUsersInput += e.key;
      }
    }

    switch (e.keyCode) {
      case 8:
        // backspace
        // удаление блока если он пустой
        if (e.target.innerText.trim() === '') {
          let id = Number(e.target.id.replace('content-editable-', ""));
          if (id != 0) {
            setTimeout(() => {
              if (e.target.innerHTML.trim() === '') {
                e.preventDefault();
                e.stopPropagation();
                const preventElement = document.getElementById('content-editable-' + (id - 1));
                this.setFormattBlock('delete', id);
                preventElement.focus();
                let range = new Range();
                range.selectNodeContents(preventElement);
                range.collapse();
                document.getSelection().removeAllRanges();
                document.getSelection().addRange(range);
              }
            });
          } else {
            e.preventDefault();
            e.stopPropagation();
          }
        }
        break;
      case 13:
        // enter
        // создание такого же блока
        // shift + enter перенос строки
        if (e.shiftKey === false && !this.keyboardTimeOut) {
          if (e.target.id.indexOf('title-editable') >= 0) {
            e.preventDefault();
            e.stopPropagation();
            const textRedactor = document.getElementById('content-editable-0');
            textRedactor.focus();
            let range = new Range();
            range.selectNodeContents(textRedactor);
            range.collapse(true);
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(range);
          } else {
            this.keyboardTimeOut = true;
            let id = Number(e.target.id.replace('content-editable-', ""));
            if (this.questionForSave.contents[id].type != 'insertOrderedList' && this.questionForSave.contents[id].type != 'insertUnorderedList') {
              e.preventDefault();
              e.stopPropagation();
              this.addBlock(id, this.questionForSave.contents[id].type);
              setTimeout(() => this.keyboardTimeOut = false, 100);
            }
          }

        } else {
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case 27:
      case 32:
        // пока недействующий обработчик
        if (this.searchUsersInput !== '') {
          this.searchUsersInput = '';
        }
        this.modalService.close('search-users');
        break;
      case 37:
      case 38:
      case 39:
      case 40:
        // left & up & right & down arrow
        // перемещение между блоками с помощью стрелок
        let id = Number(e.target.id.replace('content-editable-', ""));
        let row: number;
        switch (this.questionForSave.contents[id].type) {
          case 'H1':
            row = 42;
            break;
          case 'H2':
            row = 33;
            break;
          default:
            row = 24;
            break;
        }
        const cursorNode: any = document.getSelection();
        const cursour: any = document.getSelection().getRangeAt(0).getBoundingClientRect();
        const container: any = e.target.getBoundingClientRect();
        let bloclRows = e.target.offsetHeight / row;

        let setRange = (node, up) => {
          node.focus();
          let range = new Range();
          range.selectNodeContents(node);
          range.collapse(up);
          document.getSelection().removeAllRanges();
          document.getSelection().addRange(range);
        }

        let preventFocus = () => {
          const preventElement = document.getElementById('content-editable-' + (id - 1));
          if (preventElement) {
            setRange(preventElement, false);
          }
        }

        let nextFocus = () => {
          const nextElement = document.getElementById('content-editable-' + (id + 1));
          if (nextElement) {
            setRange(nextElement, true);
          }
        }

        switch (e.keyCode) {
          case 37:
            if (cursorNode.anchorOffset === 0) {
              e.preventDefault();
              e.stopPropagation();
              preventFocus();
            }
            break;
          case 38:
            if (e.target.innerText.trim() === '' && cursorNode.anchorOffset === 0) {
              e.preventDefault();
              e.stopPropagation();
              preventFocus();
            } else {
              setTimeout(() => {
                if (bloclRows === 1 || cursour.height != 0 && cursour.y - container.y < row) {
                  preventFocus();
                }
              })
            }
            break;
          case 39:
            if (cursorNode.anchorOffset === e.target.innerText.length) {
              e.preventDefault();
              e.stopPropagation();
              nextFocus();
            }
            break;
          case 40:
            if (container.y + container.height - cursour.y < row) {
              e.preventDefault();
              e.stopPropagation();
              nextFocus();
            } else if (e.target.innerText.trim() === '' && cursorNode.anchorOffset === (bloclRows - 1) || e.target.innerText.trim() != '' && cursorNode.anchorOffset === bloclRows) {
              nextFocus();
            } else {
              setTimeout(() => {
                if (bloclRows === 1) {
                  nextFocus();
                }
              })
            }
            break;
        }
        break;
      case 50:
        // кнопка @
        if (e.shiftKey && e.key === '@') {
          const position: any = document.getSelection().getRangeAt(0).getBoundingClientRect();
          this.modals.users.x = position.x;
          this.modals.users.y = position.y + 85;
          this.searchUsersInput += e.key;
          setTimeout(() => {
            this.modalService.open('search-users');
          }, 100);
        }
        break;
    }
  }

  addBlock(id?: number, type?: string): void {
    const item = {
      type: type ? type : 'p',
      content: '',
      checkStatus: false
    };

    if (id >= 0) {
      const idNewBlock = id + 1;
      this.question.contents.splice(idNewBlock, 0, { ...item });
      this.questionForSave.contents.splice(idNewBlock, 0, { ...item });
      setTimeout(() => {
        if (type) {
          this.setFormattBlock(type, idNewBlock);
        }
      });
    } else {
      this.question.contents.push(JSON.parse(JSON.stringify(item)));
      this.questionForSave.contents.push(JSON.parse(JSON.stringify(item)));
      if (this.question.contents.length > 1) {
        setTimeout(() => {
          const newDoc = document.getElementById('content-editable-' + (this.question.contents.length - 1));
          newDoc.focus();
          this.saveChange();
        });
      }
    }
  }

  emitCheckBox(event, i): void {
    this.question.contents[i].checkStatus = event;
    this.questionForSave.contents[i].checkStatus = event;
    const title = document.getElementById('title-editable').innerText;
    this.questionForSave.title = title;
    this.content.emit({ element: this.questionForSave });
  }

  // изменение позиции иконки меню в зависимости от типа блока
  menuIconPosition(element): number {
    let position: number;
    switch (element.type) {
      case 'H1':
        position = 12;
        break;
      case 'H2':
        position = 7;
        break;
      default:
        position = 3;
        break;
    }
    return position;
  }

  // функция для определения пустого блока
  checkTrimContent(i): any {
    if (this.questionForSave.contents[i]) {
      if (this.questionForSave.contents[i].content) {
        return this.questionForSave.contents[i].content.replace(/(\<(\/?[^>]+)>)/g, '').trim();
      } else {
        return '';
      }
    } else {
      return undefined;
    }
  }
}
