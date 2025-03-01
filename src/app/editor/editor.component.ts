import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  viewChild,
} from '@angular/core';
import { RouterPreloader } from '@angular/router';
import { trace } from 'node:console';
import * as Ropeutils from '../Models/Rope';
import { FromToPanelService } from '../from-to-panel.service';
@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  standalone: true,
})
export class EditorComponent {
  NormalMode = 'Normal';
  InsertMode = 'Insert';
  VisualMode = 'Visual';
  CounterMotion: string = '';
  CurrentMode: string = '';
  Lines: HTMLElement[] = [];
  lintpointer: number = 0;
  LastLineUsed: HTMLParagraphElement | null = null;
  constructor(
    private renderer: Renderer2,
    private sharedService: FromToPanelService,
  ) {}
  @ViewChild('lineField') LineField?: ElementRef<HTMLElement>;
  @ViewChild('FirstLineToExist') FirstLineToExist?: ElementRef<HTMLElement>;
  ngOnInit() {}

  ngAfterViewInit() {
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
    } else if (keyevent.key === 'j' && this.CurrentMode == this.NormalMode) {
      if (this.CounterMotion == '') {
        this.MoveDown();
      } else {
        this.sendText([this.CurrentMode, this.CounterMotion + keyevent.key]);
        this.MoveDown(Number(this.CounterMotion));
      }
    } else if (keyevent.key === 'k' && this.CurrentMode == this.NormalMode) {
      if (this.CounterMotion == '') {
        this.MoveUp();
      } else {
        this.sendText([this.CurrentMode, this.CounterMotion + keyevent.key]);
        this.MoveUp(Number(this.CounterMotion));
      }
    } else if (isNaN(Number(keyevent.key))) {
      this.CounterMotion = '';
    }
  }
  updateCursorStyle(LinePointer: number) {
    const p = this.GetP(this.Lines[LinePointer]);
    console.log(this.LastLineUsed);
    if (p) {
      if (this.LastLineUsed)
        this.LastLineUsed.classList.remove(
          'normal-mode',
          'insert-mode',
          'visual-mode',
        );
      console.log(this.LastLineUsed?.classList);

      switch (this.CurrentMode) {
        case this.NormalMode:
          p.classList.add('normal-mode');
          break;
        case this.InsertMode:
          p.classList.add('insert-mode');
          break;
        case this.VisualMode:
          p.classList.add('visual-mode');
          break;
      }
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
    if (event.key == 'Enter') {
      event.preventDefault();
    }
    if (this.Lines[this.lintpointer + 1] == null) {
      this.RenderLine();
      this.lintpointer++;
      this.DisplayPointer(this.lintpointer);
    } else {
      const div = this.Lines[this.lintpointer + 1];
      const p = this.GetP(div);
      this.Move(p);
      this.lintpointer++;
      this.DisplayPointer(this.lintpointer);
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
  RenderLine() {
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
    this.Lines.push(div);
    this.Move(p);
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
