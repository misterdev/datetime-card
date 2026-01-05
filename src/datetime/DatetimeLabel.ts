import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IEntity, IHass } from '../types';
import { formatDayString, getState, resetDate } from './datetime';
import { holdDirective } from '../directives/hold-directive';

@customElement('datetime-label')
export class DatetimeLabel extends LitElement {
  @property({ type: Object }) entity!: IEntity;
  @property({ type: Boolean }) showMonths = false;
  @property({ type: Object }) hass!: IHass;
  @property({ type: Boolean }) isUntilMode = false;
  @property({ type: Boolean }) debug = false;

  get label(): string {
    return formatDayString(getState(this.hass, this.entity), this.showMonths);
  }

  get dateValue(): string {
    return this.hass?.states?.[this.entity?.id]?.state || "No date";
  }

  get entityDate(): Date {
    return this.hass?.states?.[this.entity?.id]?.state
      ? new Date(this.hass.states[this.entity.id].state)
      : new Date();
  }

  get currentDate(): Date {
    return new Date();
  }

  get diffMs(): number {
    return this.currentDate.getTime() - this.entityDate.getTime();
  }

  get diffDays(): number {
    return this.diffMs / (1000 * 60 * 60 * 24);
  }

  get floorDays(): number {
    return Math.floor(this.diffDays);
  }

  get debugCalc(): string {
    return `Current: ${this.currentDate.toISOString()} | Entity: ${this.entityDate.toISOString()} | Diff: ${this.diffDays.toFixed(2)} days | Floor: ${this.floorDays}`;
  }

  render() {
    return html`
      <div
        class="container"
        data-testid="days"
        title="hold to reset"
        ${holdDirective((event: CustomEvent) =>
          resetDate(this.entity, event, this.hass, this.isUntilMode ? 1 : 0)
        )}>
        <div>${this.label}</div>
        ${this.debug ? html`
          <div class="debug-date">${this.dateValue}</div>
          <div class="debug-date">${this.debugCalc}</div>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    .container {
      white-space: nowrap;
      cursor: pointer;
    }

    .debug-date {
      font-size: 0.7em;
      color: gray;
      font-style: italic;
    }
  `;
}
