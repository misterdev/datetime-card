import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IEntity, IHass } from '../types';
import { getState, isExpired, resetDate } from './datetime';
import { holdDirective } from '../directives/hold-directive';

@customElement('datetime-bar')
export class DatetimeBar extends LitElement {
  @property({ type: Object }) entity!: IEntity;
  @property({ type: String }) friendlyName = '';
  @property({ type: Object }) hass!: IHass;
  @property({ type: Boolean }) isUntilMode = false;
  @property({ type: Boolean }) showLabels = false;

  get threshold(): number {
    return this.entity?.threshold || 0;
  }

  get state(): number {
    return getState(this.hass, this.entity);
  }

  get barColor(): "#df4c1e" | "#0da035" {
    return isExpired(this.threshold, this.isUntilMode, this.state)
      ? "#df4c1e"
      : "#0da035";
  }

  get barHeight(): 3 | 18 {
    return this.showLabels ? 18 : 3;
  }

  get name(): string {
    return this.friendlyName || this.hass?.states?.[this.entity?.id]?.attributes?.friendly_name || '';
  }

  get barWidth(): number {
    return Math.min((100 * this.state) / this.threshold + (this.isUntilMode ? 100 : 0), 100);
  }

  render() {
    return html`
      <div
        data-testid="external-bar"
        class="external-bar"
        style="height: ${this.barHeight}px"
        title="hold to reset"
        ${holdDirective((event: CustomEvent) =>
          resetDate(this.entity, event, this.hass, this.isUntilMode ? 1 : 0)
        )}>
        <div
          data-testid="internal-bar"
          class="internal-bar"
          style="width: ${this.barWidth}%; height: ${this.barHeight}px; background: ${this.barColor}">
        </div>

        ${this.showLabels && !!this.name ? html`
          <div
            data-testid="friendly-name"
            class="friendly-name"
            style="filter: drop-shadow(1px 1px 1px ${this.barColor})">
            ${this.name}
          </div>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    .external-bar {
      position: relative;
      height: 3px;
      background: #a0dea0;
      flex-grow: 1;
      cursor: pointer;
    }

    .internal-bar {
      width: 0;
      height: 3px;
      max-width: 100%;
    }

    .friendly-name {
      position: absolute;
      top: 0;
      margin-left: 3px;
      color: white;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
}
