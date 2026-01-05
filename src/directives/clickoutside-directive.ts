import { Directive, directive, PartInfo, PartType } from 'lit/directive.js';
import { AsyncDirective } from 'lit/async-directive.js';

class ClickOutsideDirective extends AsyncDirective {
  private element?: Element;
  private callback?: () => void;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('clickOutside directive must be used on element');
    }
  }

  render(callback: () => void) {
    return '';
  }

  update(part: any, [callback]: [callback: () => void]) {
    this.callback = callback;
    return this.render(callback);
  }

  override connectedCallback() {
    super.connectedCallback();
    this.element = this.element ?? (this as any).element;

    // Use capture phase for proper event handling
    document.addEventListener('click', this.handleClick, true);
  }

  override disconnectedCallback() {
    document.removeEventListener('click', this.handleClick, true);
    super.disconnectedCallback();
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.target as Node;

    if (this.element &&
        !this.element.contains(target) &&
        !event.defaultPrevented &&
        this.callback) {
      this.callback();
    }
  }
}

export const clickOutsideDirective = directive(ClickOutsideDirective);
