import { Directive, directive, PartInfo, PartType } from 'lit/directive.js';
import { AsyncDirective } from 'lit/async-directive.js';

class HoldDirective extends AsyncDirective {
  private element?: Element;
  private callback?: (e: CustomEvent) => void;
  private threshold = 500;
  private timeout?: number;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('hold directive must be used on element');
    }
  }

  render(callback: (e: CustomEvent) => void, threshold = 500) {
    return '';
  }

  update(part: any, [callback, threshold = 500]: [callback: (e: CustomEvent) => void, threshold?: number]) {
    this.callback = callback;
    this.threshold = threshold;
    return this.render(callback, threshold);
  }

  override reconnected() {
    this.attachListeners();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.element = this.element ?? (this as any).element;
    this.attachListeners();
  }

  override disconnectedCallback() {
    this.cleanup();
    super.disconnectedCallback();
  }

  private attachListeners() {
    if (!this.element) return;

    this.element.addEventListener('mousedown', this.handleStart);
    this.element.addEventListener('touchstart', this.handleStart);
  }

  private handleStart = () => {
    if (!this.element || !this.callback) return;

    this.timeout = window.setTimeout(() => {
      const event = new CustomEvent('hold', { bubbles: true, composed: true });
      this.element!.dispatchEvent(event);
      this.callback!(event);
      this.removeMovementListeners();
    }, this.threshold);

    this.element.addEventListener('mousemove', this.cancel);
    this.element.addEventListener('mouseup', this.cancel);
    this.element.addEventListener('touchcancel', this.cancel);
    this.element.addEventListener('touchend', this.cancel);
    this.element.addEventListener('touchmove', this.cancel);
  }

  private cancel = () => {
    clearTimeout(this.timeout);
    this.removeMovementListeners();
  }

  private removeMovementListeners() {
    if (!this.element) return;
    this.element.removeEventListener('mousemove', this.cancel);
    this.element.removeEventListener('mouseup', this.cancel);
    this.element.removeEventListener('touchcancel', this.cancel);
    this.element.removeEventListener('touchend', this.cancel);
    this.element.removeEventListener('touchmove', this.cancel);
  }

  private cleanup() {
    if (!this.element) return;
    this.element.removeEventListener('mousedown', this.handleStart);
    this.element.removeEventListener('touchstart', this.handleStart);
    this.removeMovementListeners();
    clearTimeout(this.timeout);
  }
}

export const holdDirective = directive(HoldDirective);
