
export class AutocompleteStyle {
  'width'?: string;
  'color'?: string;
  'font-size'?: string;
  'border-radius'?: string;
  'border-color'?: string;
  'height'?: string;
  'line-height'?: string;

  constructor(style) {
    this['width'] = style['width'];
    this['color'] = style['color'];
    this['font-size'] = style['font-size'];
    this['border-radius'] = style['border-radius'];
    this['border-color'] = style['border-color'];
    this['height'] = style['height'];
    this['line-height'] = style['line-height'];
  }
}
