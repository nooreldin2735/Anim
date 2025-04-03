import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  viewChild,
} from '@angular/core';
import { RouterPreloader } from '@angular/router';
import { Console, trace } from 'node:console';
import * as Ropeutils from '../Models/Rope';
import * as BufferUtil from '../Models/GapBuffer';
import { FromToPanelService } from '../from-to-panel.service';
import { buffer } from 'node:stream/consumers';
@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  standalone: true,
})
export class EditorComponent {
  //Constans
  NormalMode = 'Normal';
  InsertMode = 'Insert';
  VisualMode = 'Visual';

  //Motion
  CounterMotion: string = '';
  CurrentMode: string = '';
  lintpointer: number = 0;
  Cursor_pos: number = 0;

  //Datas
  LastLineUsed: HTMLParagraphElement | null = null;
  buffer: BufferUtil.GapBuffer[];
  Lines: HTMLElement[] = [];

  constructor(
    private renderer: Renderer2,
    private sharedService: FromToPanelService,
  ) {
    this.buffer = new Array();
  }
  @ViewChild('lineField') LineField?: ElementRef<HTMLElement>;
  @ViewChild('FirstLineToExist') FirstLineToExist?: ElementRef<HTMLElement>;
  ngOnInit() { }

  ngAfterViewInit() {
    this.buffer[0]=new BufferUtil.GapBuffer();
    if (this.FirstLineToExist?.nativeElement) {
      this.Lines.push(this.FirstLineToExist.nativeElement);
      const p = this.GetP(this.FirstLineToExist.nativeElement);
      this.Move(p);
      this.LastLineUsed = p;
    }

    this.CurrentMode = this.NormalMode;

    setTimeout(() => {
      this.updateCursorStyle(this.lintpointer);
      this.sendText([this.NormalMode]);
    }, 0);
  }

  ListenToCommand(event: Event) {
    const keyevent: KeyboardEvent = event as KeyboardEvent;

      console.log(keyevent.key);
    if (this.CurrentMode == this.InsertMode && keyevent.key == 'ArrowRight') {
      this.Cursor_pos++;
    } else if (
      this.CurrentMode == this.InsertMode &&
      keyevent.key == 'ArrowLeft'
    ) {
      this.Cursor_pos--;
    } else if (
      this.CurrentMode == this.InsertMode &&
      keyevent.key == 'ArrowUp'
    ) {
      if (
        this.Lines[this.lintpointer - 1] != null ||
        this.lintpointer - 1 >= 0
      ) {
        this.lintpointer--;
        const p = this.GetP(this.Lines[this.lintpointer]);
        this.Move(p);
      }
    } else if (
      this.CurrentMode == this.InsertMode &&
      keyevent.key == 'ArrowDown'
    ) {
      if (this.Lines[this.lintpointer + 1] != null) {
        this.lintpointer++;
        const p = this.GetP(this.Lines[this.lintpointer]);
        this.Move(p);
      }
    } else if (this.CurrentMode == this.InsertMode&&keyevent.key!="Escape") {
      this.buffer[this.lintpointer].Insert(keyevent.key,this.Cursor_pos);
      this.Cursor_pos++;
      console.log(this.Cursor_pos);
      this.moveCursorToPosition(this.GetP(this.Lines[this.lintpointer]),this.Cursor_pos);
      return;

    }

    if (!isNaN(Number(keyevent.key)) && this.CurrentMode == this.NormalMode) {
      if (this.CounterMotion.length <= 3) {
        this.CounterMotion += keyevent.key;
        this.sendText([this.CurrentMode, this.CounterMotion]);
      }
    } else {
      this.sendText([this.CurrentMode, keyevent.key]);
    }
    if (this.CurrentMode == this.NormalMode) {
      keyevent.preventDefault();
    }
    if (
      keyevent.key == 'Escape' &&
      (this.CurrentMode == this.InsertMode ||
        this.CurrentMode == this.VisualMode)
    ) {
      this.CurrentMode = this.NormalMode;
      this.updateCursorStyle(this.lintpointer);
      this.sendText([this.NormalMode]);
      this.moveCursorToPosition(this.GetP(this.Lines[this.lintpointer]),this.Cursor_pos);
    } else if (keyevent.key == 'i' && this.CurrentMode == this.NormalMode) {
      this.CurrentMode = this.InsertMode;
      const Current_line = event.target as HTMLElement;
      Current_line.classList.remove(
        'normal-mode',
        'insert-mode',
        'visual-mode',
      );
      this.updateCursorStyle(this.lintpointer);
      this.sendText([this.InsertMode]);
    } else if (
      keyevent.key === 'Enter' &&
      this.CurrentMode == this.InsertMode
    ) {
      this.AddLine(keyevent);
    } else if (
      (keyevent.key === 'j' || keyevent.key == 'ArrowDown') &&
      this.CurrentMode == this.NormalMode
    ) {
      if (this.CounterMotion == '') {
        this.MoveDown();
      } else {
        this.sendText([this.CurrentMode, this.CounterMotion + keyevent.key]);
        this.MoveDown(Number(this.CounterMotion));
      }
    } else if (
      (keyevent.key == 'l' || keyevent.key == 'ArrowRight') &&
      this.CurrentMode == this.NormalMode
    ) {
      const p = this.GetP(this.Lines[this.lintpointer]);
      this.MoveRight(p,keyevent);
    } else if (
      (keyevent.key == 'h' || keyevent.key == 'ArrowLeft') &&
      this.CurrentMode == this.NormalMode
    ) {
      const p=this.GetP(this.Lines[this.lintpointer]);
      this.MoveLeft(p,keyevent);
    }
      else if (

      (keyevent.key === 'k' || keyevent.key == 'ArrowUp') &&
      this.CurrentMode == this.NormalMode
    ) {
      if (this.CounterMotion == '') {
        this.MoveUp();
      } else {
        this.sendText([this.CurrentMode, this.CounterMotion + keyevent.key]);
        this.MoveUp(Number(this.CounterMotion));
      }
    } else if (isNaN(Number(keyevent.key))) {
      this.CounterMotion = '';
    }
    console.log(this.Cursor_pos);
  }

  updateCursorStyle(LinePointer: number, charIndex: number = 0) {
    const p = this.GetP(this.Lines[LinePointer]); // Get the <p> element
    if (!p) return;

    if (this.LastLineUsed) {
      this.LastLineUsed.classList.remove(
        'normal-mode',
        'insert-mode',
        'visual-mode',
      );
    }

    if (this.CurrentMode === this.NormalMode) {
      p.classList.add('normal-mode');

      // Get text before the cursor
      const textBeforeCursor = p.textContent?.slice(0, charIndex) || '';

      // Calculate text width using a hidden span (avoiding direct measurement issues)
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'pre';
      tempSpan.textContent = textBeforeCursor;
      document.body.appendChild(tempSpan);

      // Get width and remove temp span
      const cursorX = tempSpan.getBoundingClientRect().width;
      tempSpan.remove();

      // Apply the position
      p.style.setProperty('--cursor-x', `${cursorX}px`);
    }
  }

  MoveLeft(p:HTMLParagraphElement,keyevent:KeyboardEvent){

    if (p.innerHTML[this.Cursor_pos - 1] != null) {
      if (this.CounterMotion == '') {
        this.moveCursorToPosition(p, this.Cursor_pos - 1);
        this.Cursor_pos--;
      } else {
        if (p.innerHTML[this.Cursor_pos + Number(this.CounterMotion)] != null) {
          this.sendText([this.CurrentMode, this.CounterMotion + keyevent.key]);
          this.moveCursorToPosition(
            p,
            Number(this.CounterMotion) + this.Cursor_pos,
          );
          this.Cursor_pos -= Number(this.CounterMotion);
        } else {
          this.Cursor_pos = 0;
          this.moveCursorToPosition(p, this.Cursor_pos);
        }
      }
    } else {
      console.log('End OF line');
    }
  }
  MoveRight(p: HTMLParagraphElement,keyevent:KeyboardEvent) {
    if (p.innerHTML[this.Cursor_pos + 1] != null) {
      if (this.CounterMotion == '') {
        this.moveCursorToPosition(p, this.Cursor_pos + 1);
        this.Cursor_pos++;
      } else {
        if (p.innerHTML[this.Cursor_pos + Number(this.CounterMotion)] != null) {
          this.sendText([this.CurrentMode, this.CounterMotion + keyevent.key]);
          this.moveCursorToPosition(
            p,
            Number(this.CounterMotion) + this.Cursor_pos,
          );
          this.Cursor_pos += Number(this.CounterMotion);
        } else {
          this.Cursor_pos = p.innerHTML.length - 1;
          this.moveCursorToPosition(p, this.Cursor_pos);
        }
      }
    } else {
      console.log('End OF line');
    }
  }
  MoveUp(countermotion: number = 1) {
    this.LastLineUsed = this.Lines[this.lintpointer].querySelector('p');
    this.CounterMotion = '';
    if (this.Lines[this.lintpointer - countermotion] != null) {
      const div = this.Lines[this.lintpointer - countermotion];
      const p = this.GetP(div);
      this.Move(p);
      this.lintpointer -= countermotion;
      this.DisplayPointer(this.lintpointer);
      this.updateCursorStyle(this.lintpointer);
    } else {
      const div = this.Lines[0];
      const p = this.GetP(div);
      this.Move(p);
      this.lintpointer = 0;
      this.DisplayPointer(this.lintpointer);
      this.updateCursorStyle(this.lintpointer);
    }
  }
  MoveDown(countermotion: number = 1) {
    this.LastLineUsed = this.Lines[this.lintpointer].querySelector('p');
    this.CounterMotion = '';
    if (this.Lines[this.lintpointer + countermotion] != null) {
      const div = this.Lines[this.lintpointer + countermotion];
      const p = this.GetP(div);
      this.Move(p);
      this.lintpointer += countermotion;
      this.DisplayPointer(this.lintpointer);
      this.updateCursorStyle(this.lintpointer);
    } else {
      const div = this.Lines[this.Lines.length - 1];
      const p = this.GetP(div);
      this.Move(p);
      this.lintpointer = this.Lines.length - 1;
      this.DisplayPointer(this.lintpointer);
      this.updateCursorStyle(this.lintpointer);
    }
  }
  AddLine(event: KeyboardEvent) {
    this.LastLineUsed = this.Lines[this.lintpointer].querySelector('p');
    console.log('`````````````````````````````````````````');
    console.log(this.lintpointer);
    if (event.key == 'Enter') {
      event.preventDefault();
    }
    if (this.Lines[this.lintpointer + 1] == null) {
      this.buffer[this.lintpointer+1]=new BufferUtil.GapBuffer();
      const div = this.RenderLine();
      const p = this.GetP(div);
      this.Move(p);
      this.Lines.push(div);
      this.lintpointer++;
      this.DisplayPointer(this.lintpointer);
    } else {
    }
  }
  GetSpan(div: HTMLDivElement): HTMLSpanElement | null {
    return div.querySelector('span');
  }
  GetP(div: HTMLElement): HTMLParagraphElement {
    let p = div.querySelector('p');

    if (!p) {
      p = document.createElement('p');
    }

    return p;
  }
  RenderLine(): HTMLElement {
    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, 'Line');
    const p = this.renderer.createElement('p');
    this.renderer.setAttribute(p, 'contentEditable', 'true');
    const span = this.renderer.createElement('span');
    const textspan = this.renderer.createText('2');
    this.renderer.appendChild(span, textspan);
    this.renderer.appendChild(div, span);
    this.renderer.appendChild(div, p);
    this.renderer.appendChild(this.LineField?.nativeElement, div);
    return div;
  }
  Move(p: HTMLParagraphElement) {
    setTimeout(() => {
      p.focus(); // Focus on the new paragraph
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(p);
      range.collapse(false); // Move cursor to the end
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, 0);
  }
  moveCursorToPosition(element: HTMLElement, position: number) {
    const range = document.createRange();
    const selection = window.getSelection();

    this.CounterMotion = '';
    if (element.childNodes.length > 0) {
      setTimeout(() => {
        range.setStart(element.childNodes[0], position);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
        this.updateCursorStyle(this.lintpointer, position);
        console.log('moved');
      }, 10);
    }
  }
  DisplayPointer(linePoiner: number) {
    for (let i: number = 0; i < this.Lines.length; i++) {
      const div_curr = this.Lines[i];
      const span_curr = div_curr.querySelector('span');
      if (span_curr) {
        setTimeout(() => {
          span_curr.className = '';
        }, 0);
      }
    }
    const div_curr = this.Lines[linePoiner];
    const span_curr = div_curr.querySelector('span');
    if (span_curr) {
      const val = linePoiner + 1;
      setTimeout(() => {
        span_curr.innerText = val.toString();
        span_curr.className = 'SlectedCursor';
      }, 0);
    }
    let aux_up = 1;
    let aux_down = 1;
    for (let i: number = linePoiner - 1; i >= 0; i--) {
      const div = this.Lines[i];
      const span = div.querySelector('span');
      if (span) {
        setTimeout(() => {
          span.innerText = aux_up.toString();
          aux_up++;
        }, 0);
      }
    }
    for (let i: number = linePoiner + 1; i < this.Lines.length; i++) {
      const div = this.Lines[i];
      const span = div.querySelector('span');
      if (span) {
        setTimeout(() => {
          span.innerText = aux_down.toString();
          aux_down++;
        }, 0);
      }
    }
  }
  sendText(Massege: string[]) {
    this.sharedService.updateMessage(Massege);
  }
}
