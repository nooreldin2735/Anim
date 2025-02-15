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
@Component({
  selector: 'app-editor',
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  standalone: true,
})
export class EditorComponent {
  Lines: HTMLElement[] = [];
  lintpointer: number = 0;
  constructor(private renderer: Renderer2) {}
  @ViewChild('lineField') LineField?: ElementRef<HTMLElement>;
  @ViewChild('FirstLineToExist') FirstLineToExist?: ElementRef<HTMLElement>;
  ngOnInit() {}

  ngAfterViewInit() {
    if (this.FirstLineToExist?.nativeElement)
      this.Lines.push(this.FirstLineToExist.nativeElement);
  }

  MoveUp() {
    console.log(this.Lines.length);
    if (this.Lines[this.lintpointer - 1] != null) {
      const div = this.Lines[this.lintpointer - 1];
      const p = this.GetP(div);
      this.Move(p);
      this.lintpointer--;
      this.DisplayPointer(this.lintpointer);
    }
  }
  MoveDown() {
    console.log('down');
    if (this.Lines[this.lintpointer + 1] != null) {
      const div = this.Lines[this.lintpointer + 1];
      const p = this.GetP(div);
      this.Move(p);
      this.lintpointer++;
      this.DisplayPointer(this.lintpointer);
    }
  }
  AddLine(event: Event) {
    const keyevent: KeyboardEvent = event as KeyboardEvent;
    if (keyevent.key == 'Enter') {
      keyevent.preventDefault();
    }
    if (this.Lines[this.lintpointer + 1] == null) {
      this.RenderLine();
      this.lintpointer++;
      this.DisplayPointer(this.lintpointer);
    } else {
      console.log(this.lintpointer);
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
    this.renderer.listen(p, 'keydown.enter', (event: Event) => {
      this.AddLine(event);
    });
    this.renderer.listen(p, 'keydown.k', (event: Event) => {
      this.MoveUp();
    });
    this.renderer.listen(p, 'keydown.j', (event: Event) => {
      this.MoveDown();
    });
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
    console.log('--------------------------------');

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
      console.log(span_curr);
      const val = linePoiner + 1;
      setTimeout(() => {
        span_curr.innerText = val.toString();
        span_curr.className = 'SlectedCursor';
      }, 0);
    }
    console.log(linePoiner);
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
      console.log('up');
      console.log(i);
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
      console.log('down');
      console.log(i);
    }
  }
}
