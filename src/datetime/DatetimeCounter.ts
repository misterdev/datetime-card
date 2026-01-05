import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IEntity, IHass, ICounterDisplay, IDatetimeState } from '../types';
import { calculateDatetimeState, formatDayString, resetDate } from './datetime';
import { holdDirective } from '../directives/hold-directive';

export type CounterType = 'since' | 'until';

@customElement('datetime-counter')
export class DatetimeCounter extends LitElement {
  @property({ type: Object }) entity!: IEntity;
  @property({ type: Object }) hass!: IHass;
  @property({ type: String }) counterType!: CounterType;
  @property({ type: Object }) displayConfig?: ICounterDisplay;
  @property({ type: Boolean }) showLabels = false;
  @property({ type: Boolean }) debug = false;

  get state(): IDatetimeState {
    return calculateDatetimeState(this.hass, this.entity);
  }

  get days(): number {
    return this.counterType === 'since'
      ? this.state.daysSinceLastEvent
      : this.state.daysUntilNextEvent;
  }

  get barWidth(): number {
    if (this.counterType === 'since') {
      // Since counter: fills from 0% to 100% as time passes toward threshold
      return Math.min((100 * this.state.daysSinceLastEvent) / this.entity.threshold, 100);
    } else {
      // Until counter: fills from 0% to 100% as deadline approaches
      if (!this.entity.frequency_days) return 0;
      const progress = (this.state.daysSinceLastEvent / this.entity.frequency_days) * 100;
      return Math.min(progress, 100);
    }
  }

  get barColor(): string {
    if (this.counterType === 'since') {
      return this.state.daysSinceLastEvent >= this.entity.threshold ? "#df4c1e" : "#0da035";
    } else {
      return this.state.isOverdue ? "#df4c1e" : "#0da035";
    }
  }

  get label(): string {
    const showMonths = this.displayConfig?.showMonths ?? false;
    const daysText = formatDayString(this.days, showMonths);

    // Add "overdue" suffix for until counter when overdue
    if (this.counterType === 'until' && this.state.isOverdue) {
      return `${daysText} overdue`;
    }

    return daysText;
  }

  get counterLabel(): string {
    if (this.displayConfig?.label) return this.displayConfig.label;
    return this.counterType === 'since' ? 'Since last' : 'Until next';
  }

  get barHeight(): 3 | 18 {
    return this.showLabels ? 18 : 3;
  }

  get debugInfo(): string {
    if (!this.debug) return '';

    const current = new Date();
    const last = this.state.lastEventDate;
    const next = this.state.nextEventDate;

    return `Current: ${current.toISOString()} | Last: ${last.toISOString()}${next ? ` | Next: ${next.toISOString()}` : ''} | Days: ${this.days}`;
  }

  render() {
    return html`
      <!-- Progress bar -->
      <div
        class="external-bar"
        style="height: ${this.barHeight}px"
        title="hold to reset"
        ${holdDirective((event: CustomEvent) =>
          resetDate(this.entity, event, this.hass)
        )}>

        <div
          class="internal-bar"
          style="width: ${this.barWidth}%; height: ${this.barHeight}px; background: ${this.barColor}">
        </div>

        ${this.showLabels ? html`
          <div class="bar-label" style="filter: drop-shadow(1px 1px 1px ${this.barColor})">
            ${this.counterLabel}
          </div>
        ` : ''}
      </div>

      <!-- Days label -->
      <div
        class="days-label"
        title="hold to reset"
        ${holdDirective((event: CustomEvent) =>
          resetDate(this.entity, event, this.hass)
        )}>
        <div>${this.label}</div>
        ${this.debug ? html`
          <div class="debug-info">${this.debugInfo}</div>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: contents;
    }

    .external-bar {
      position: relative;
      background: #a0dea0;
      flex-grow: 1;
      cursor: pointer;
    }

    .internal-bar {
      max-width: 100%;
    }

    .bar-label {
      position: absolute;
      top: 0;
      margin-left: 3px;
      color: white;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .days-label {
      white-space: nowrap;
      cursor: pointer;
      justify-self: end;
    }

    .debug-info {
      font-size: 0.7em;
      color: gray;
      font-style: italic;
    }
  `;
}
