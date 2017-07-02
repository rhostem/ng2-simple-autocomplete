export interface AutoCompleteItem {
  value: any;         // real value
  text: string;       // text for view
  markup?: string;    // markup for view
  isFocus?: boolean;  // does item have focus(highlighted) or not
}
