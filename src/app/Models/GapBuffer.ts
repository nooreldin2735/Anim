export class GapBuffer {
  Buffer: string[];
  Gap_size: number;
  Gap_left = 0;
  Gap_right: number;
  Size: number;

  constructor() {
    this.Buffer = new Array(1000).fill('_');
    this.Gap_size = 10;
    this.Gap_right = this.Gap_size - this.Gap_left - 1;
    this.Size = 10;
  }
  Grow(k: number, postion: number): void {
    let a = this.Buffer.slice(postion, this.Size);
    this.Buffer.splice(postion, this.Size - postion, ...'_'.repeat(k));

    this.Buffer.splice(postion + k, 0, ...a);
    this.Size += k;
    this.Gap_right += k;
  }
  Left(postion: number): void {
    while (postion < this.Gap_left) {
      this.Gap_left--;
      this.Gap_right--;
      this.Buffer[this.Gap_right + 1] = this.Buffer[this.Gap_left];
      this.Buffer[this.Gap_left] = '_';
    }
  }
  Right(postion: number): void {
    while (postion > this.Gap_right) {
      this.Gap_right++;
      this.Gap_left++;
      this.Buffer[this.Gap_left - 1] = this.Buffer[this.Gap_right];
      this.Buffer[this.Gap_right] = '_';
    }
  }
  Move_cursor(postion: number) {
    if (postion < this.Gap_left) {
      this.Left(postion);
    } else {
      this.Right(postion);
    }
  }
  Insert(input: string, postion: number):number {
    let len = input.length;
    console.log("Before Insert: Gap Left:", this.Gap_left, "Gap Right:", this.Gap_right);

    let i = 0;
    if (postion != this.Gap_left) {
      this.Move_cursor(postion);
    }
    while (i < len) {
      if (this.Gap_right == this.Gap_left) {
        let k = 10;
        this.Grow(k, postion);
      }
      this.Buffer[this.Gap_left] = input.charAt(i);
      this.Gap_left++;
      i++;
      postion++;
    }
    console.log(this.Buffer)
    return this.Gap_left;
  }
}
