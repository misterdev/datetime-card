import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IEntity, IHass } from '../types';
import { getState, isExpired, resetDate } from './datetime';
import { holdDirective } from '../directives/hold-directive';

@customElement('datetime-icon')
export class DatetimeIcon extends LitElement {
  @property({ type: Object }) entity!: IEntity;
  @property({ type: Object }) hass!: IHass;
  @property({ type: Boolean }) isUntilMode = false;

  get threshold(): number {
    return this.entity?.threshold || 0;
  }

  get state(): number {
    return getState(this.hass, this.entity);
  }

  get icon(): string {
    return this.hass?.states?.[this.entity?.id]?.attributes?.icon || '';
  }

  get color(): "#df4c1e" | "#44739e" {
    return isExpired(this.threshold, this.isUntilMode, this.state)
      ? "#df4c1e"
      : "#44739e";
  }

  get title(): string {
    return this.hass?.states?.[this.entity?.id]?.attributes?.friendly_name || '';
  }

  render() {
    return html`
      <ha-icon
        data-testid="icon"
        .icon=${this.icon}
        style="color: ${this.color}"
        title="hold to reset ${this.title}"
        ${holdDirective((event: CustomEvent) =>
          resetDate(this.entity, event, this.hass, this.isUntilMode ? 1 : 0)
        )}>
      </ha-icon>
    `;
  }

  static styles = css``;
}
