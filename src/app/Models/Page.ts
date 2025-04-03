import { GapBuffer } from './GapBuffer';

class Page {

  //Motion
  CounterMotion: string = '';
  CurrentMode: string = '';
  lintpointer: number = 0;
  Cursor_pos: number = 0;

  //Datas
  LastLineUsed: HTMLParagraphElement | null = null;
  buffers: GapBuffer[];
  Lines: HTMLElement[] = [];

  constructor() {
    this.buffers = new Array();
    this.Lines = new Array();
  }


}
