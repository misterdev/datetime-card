import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IEntity, IHass, IDatetimeState } from '../types';
import { calculateDatetimeState, isExpired, resetDate } from './datetime';
import { holdDirective } from '../directives/hold-directive';

@customElement('datetime-icon')
export class DatetimeIcon extends LitElement {
  @property({ type: Object }) entity!: IEntity;
  @property({ type: Object }) hass!: IHass;
  @property({ type: Object }) state?: IDatetimeState;

  get datetimeState(): IDatetimeState {
    return this.state || calculateDatetimeState(this.hass, this.entity);
  }

  get icon(): string {
    return this.hass?.states?.[this.entity?.id]?.attributes?.icon || '';
  }

  get color(): "#df4c1e" | "#44739e" {
    return isExpired(this.datetimeState)
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
          resetDate(this.entity, event, this.hass)
        )}>
      </ha-icon>
    `;
  }

  static styles = css``;
}
