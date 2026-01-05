import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IConfig, IEntity, IHass } from './types';
import { getState, isExpired } from './datetime/datetime';
import './datetime/DatetimeIcon';
import './datetime/DatetimeBar';
import './datetime/DatetimeLabel';

function getDefaultEntities(hass: IHass): IEntity[] {
  const states = hass?.states || {};
  const id = Object.keys(states).find((id) =>
    id.startsWith("input_datetime"),
  );

  const threshold = 2 * getState(hass, { id } as IEntity);
  return id ? [{ id, threshold }] : [];
}

@customElement('datetime-card')
export class DatetimeCard extends LitElement {
  @property({ type: Object }) config!: IConfig;
  @property({ type: Object }) hass!: IHass;

  // Home Assistant interface method
  setConfig(config: IConfig): void {
    this.config = config;
  }

  // Home Assistant interface method
  static getConfigElement(): HTMLElement {
    return document.createElement("datetime-card-editor");
  }

  get entities(): IEntity[] {
    return this.config.entities || getDefaultEntities(this.hass);
  }

  get flexDirection(): "column" | "column-reverse" | "row" | "row-reverse" {
    const layout = this.config.layout || "horizontal";
    const reverse = this.config.reverse_order || false;
    const base = layout === "vertical" ? "column" : "row";
    return reverse ? `${base}-reverse` as const : base;
  }

  get showMonths(): boolean {
    return this.config.show_months || false;
  }

  get header(): string {
    return this.config.title || "Datetime Card";
  }

  get isUntilMode(): boolean {
    return this.config.mode === "until";
  }

  get filterOverdue(): boolean {
    return this.config.filter_overdue || false;
  }

  get showLabels(): boolean {
    return this.config.show_labels || false;
  }

  get debug(): boolean {
    return this.config.debug || false;
  }

  get src(): string {
    return this.config.image !== undefined
      ? this.config.image
      : "https://demo.home-assistant.io/stub_config/t-shirt-promo.png";
  }

  render() {
    return html`
      <ha-card>
        ${this.header ? html`<h1 class="card-header">${this.header}</h1>` : ''}

        <div
          data-testid="card-content"
          class="card-content"
          style="flex-direction: ${this.flexDirection}">
          ${this.src ? html`<img src="${this.src}" alt="card-pict" />` : ''}

          <div class="grid">
            ${this.entities.map(entity => {
              const shouldShow = !this.filterOverdue ||
                isExpired(entity.threshold, this.isUntilMode, getState(this.hass, entity));

              return shouldShow ? html`
                <datetime-icon
                  role="listitem"
                  .entity=${entity}
                  .hass=${this.hass}
                  .isUntilMode=${this.isUntilMode}>
                </datetime-icon>

                <datetime-bar
                  .entity=${entity}
                  .friendlyName=${entity.friendly_name || ''}
                  .hass=${this.hass}
                  .isUntilMode=${this.isUntilMode}
                  .showLabels=${this.showLabels}>
                </datetime-bar>

                <datetime-label
                  .entity=${entity}
                  .showMonths=${this.showMonths}
                  .hass=${this.hass}
                  .isUntilMode=${this.isUntilMode}
                  .debug=${this.debug}>
                </datetime-label>
              ` : '';
            })}
          </div>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .card-header {
      overflow: hidden;
      text-overflow: ellipsis !important;
      white-space: nowrap;
    }

    .card-content {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    img {
      max-width: 40%;
    }

    .grid {
      display: grid;
      flex-grow: 1;
      grid-template-columns: 24px auto min-content;
      margin: 10px;
      gap: 10px;
      align-items: center;
      width: 100%;
    }

    datetime-label {
      justify-self: end;
    }
  `;
}
