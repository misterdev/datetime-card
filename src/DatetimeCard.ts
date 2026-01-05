import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { IConfig, IEntity, IHass } from './types';
import { calculateDatetimeState, isExpired } from './datetime/datetime';
import './datetime/DatetimeRow';

function getDefaultEntities(hass: IHass): IEntity[] {
  const states = hass?.states || {};
  const id = Object.keys(states).find((id) =>
    id.startsWith("input_datetime"),
  );

  if (!id) return [];

  const state = calculateDatetimeState(hass, { id, frequency_days: 7 } as IEntity);
  const frequency_days = 7; // Default to weekly
  return [{ id, frequency_days }];
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
    const imagePosition = this.config.image_position || "start";
    const base = layout === "vertical" ? "column" : "row";
    return imagePosition === "end" ? `${base}-reverse` as const : base;
  }

  get header(): string {
    return this.config.title || "Datetime Card";
  }

  get filterOverdue(): boolean {
    return this.config.filter_overdue || false;
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

          <div class="list">
            ${this.entities.map(entity => {
              const state = calculateDatetimeState(this.hass, entity);
              const shouldShow = !this.filterOverdue || isExpired(state);

              if (!shouldShow) return '';

              return html`
                <datetime-row
                  .entity=${entity}
                  .hass=${this.hass}
                  .debug=${this.debug}>
                </datetime-row>
              `;
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
      align-items: stretch;
      gap: 16px;
      padding: 8px;
      overflow: hidden;
    }

    img {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .list {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  `;
}
