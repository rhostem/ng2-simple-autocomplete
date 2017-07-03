export interface AutoCompleteItem {
  value: any;         // real value
  text: string;       // text for view
  markup?: string;    // markup for view
  isFocus?: boolean;  // does item have focus(highlighted) or not
}

export interface AutocompleteStyle {
  'width'?: string;
  'color'?: string;
  'font-size'?: string;
  'border-radius'?: string;
  'border-color'?: string;
  'height'?: string;
  'line-height'?: string;
};
