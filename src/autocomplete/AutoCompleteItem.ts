export interface AutoCompleteItem {
  value: any;         // real value
  text: string;       // text for view
  markup?: string;    // markup for view
  isFocus?: boolean;  // does item have focus(highlighted) or not
}
// export class AutoCompleteItem {
//   value: any;         // real value
//   text: string;       // text for view
//   markup?: string;    // markup for view
//   isFocus?: boolean;  // does item have focus(highlighted) or not

//   constructor(item) {
//     this.value = item.value;
//     this.text = item.text;
//     this.markup = item.markup;
//     this.isFocus = item.isFocus;
//   }
// }
