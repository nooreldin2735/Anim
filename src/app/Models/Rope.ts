const Leaf_n = 2;

export class Rope {
  left: Rope | null;
  right: Rope | null;
  parent: Rope | null;
  str: string[] | null;
  Lcount: number;
  constructor() {
    this.left = null;
    this.right = null;
    this.parent = null;
    this.str = [];
    this.Lcount = 0;
  }
}

export function CreateRopeDataStructer(
  node: Rope | null,
  parent: Rope | null,
  a: string,
  left: number,
  right: number,
) {
  let temp: Rope = new Rope();
  temp.left = temp.right = null;
  temp.parent = parent;
  if (left - 1 > Leaf_n) {
    temp.str = null;
    temp.Lcount = Math.floor((right - left) / 2);
    node = temp;
    let m = Math.floor((left + right) / 2);
    CreateRopeDataStructer(node.left, node, a, left, m);
    CreateRopeDataStructer(node.right, node, a, m + 1, right);
  } else {
    node = temp;
    temp.Lcount = right - left;
    let j = 0;
    for (let i = left; i <= right; i++) {
      if (temp.str && a) {
        // Ensure both `temp` and `a` are not null[27;5;106~    temp.str[j++] = a[i]; [27;5;106~}[27;5;106~
        temp.str[j++] = a[i];
      }
    }
  }
  return node;
}
export function printstring(r:Rope|null) {
  if (r == null) return;
  if (r.left == null && r.right == null) {
      console.log("y");
     console.log(r.str);
  }
  printstring(r.left);
  printstring(r.right);
}
