import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { IEntity, IHass, IDatetimeState } from '../types';
import { calculateDatetimeState, formatDateShort, resetDate } from './datetime';

@customElement('datetime-row')
export class DatetimeRow extends LitElement {
  @property({ type: Object }) entity!: IEntity;
  @property({ type: Object }) hass!: IHass;
  @property({ type: Boolean }) debug = false;

  @state() private dialogOpen = false;
  @state() private selectedDate = '';

  get state(): IDatetimeState {
    return calculateDatetimeState(this.hass, this.entity);
  }

  get icon(): string {
    return this.hass?.states?.[this.entity?.id]?.attributes?.icon || 'mdi:calendar';
  }

  get name(): string {
    return this.entity.friendly_name ||
           this.hass?.states?.[this.entity?.id]?.attributes?.friendly_name ||
           'Unknown';
  }

  get barWidth(): number {
    const frequencyDays = this.entity.frequency_days && this.entity.frequency_days > 0
      ? this.entity.frequency_days
      : 7;
    const progress = (this.state.daysSinceLastEvent / frequencyDays) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  get barColor(): string {
    return this.state.isOverdue ? "#df4c1e" : "#0da035";
  }

  get statusText(): string {
    const daysSince = this.state.daysSinceLastEvent;
    const daysUntil = this.state.daysUntilNextEvent;

    // Validate date before formatting
    const nextDate = this.state.nextEventDate && !isNaN(this.state.nextEventDate.getTime())
      ? formatDateShort(this.state.nextEventDate)
      : 'Unknown';

    const sinceText = daysSince === 0 ? 'today' :
                      daysSince === 1 ? '1 day ago' :
                      `${daysSince} days ago`;

    if (this.state.isOverdue) {
      const overdueDays = Math.abs(daysUntil);
      const overdueText = overdueDays === 1 ? '1 day' : `${overdueDays} days`;
      return `${sinceText} • Overdue by ${overdueText}`;
    } else {
      const untilText = daysUntil === 0 ? 'today' :
                        daysUntil === 1 ? 'tomorrow' :
                        `in ${daysUntil} days`;
      return `${sinceText} • Due ${nextDate} (${untilText})`;
    }
  }

  private handleClick(event: Event): void {
    // Format current last event date as YYYY-MM-DD
    const lastDate = this.state.lastEventDate;
    const year = lastDate.getFullYear();
    const month = String(lastDate.getMonth() + 1).padStart(2, '0');
    const day = String(lastDate.getDate()).padStart(2, '0');
    this.selectedDate = `${year}-${month}-${day}`;

    this.dialogOpen = true;
  }

  private closeDialog(): void {
    this.dialogOpen = false;
  }

  private handleDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
  }

  private submitDate(): void {
    if (!this.selectedDate) return;

    // Parse date string as local time (YYYY-MM-DD format from input type="date")
    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);

    // Skip confirmation since user already confirmed in our dialog
    resetDate(this.entity, selectedDateObj, this.hass, true);
    this.dialogOpen = false;
  }

  private markAsDone(): void {
    // Set date to today
    const today = new Date();
    resetDate(this.entity, today, this.hass, true);
    this.dialogOpen = false;
  }

  render() {
    return html`
      <div
        class="row"
        @click=${this.handleClick}>
        <ha-icon
          class="icon"
          .icon=${this.icon}
          style="color: ${this.barColor}"
          title="click to edit date">
        </ha-icon>

        <div class="content">
          <div class="header">
            <span class="name">${this.name}</span>
            <span class="status">${this.statusText}</span>
          </div>

          <div class="bar-container">
            <div
              class="bar"
              style="width: ${this.barWidth}%; background: ${this.barColor}">
            </div>
          </div>

          ${this.debug ? html`
            <div class="debug">
              Last: ${this.state.lastEventDate.toISOString().split('T')[0]} |
              Next: ${this.state.nextEventDate.toISOString().split('T')[0]} |
              Progress: ${this.barWidth.toFixed(0)}%
            </div>
          ` : ''}
        </div>
      </div>

      ${this.dialogOpen ? html`
        <div class="dialog-backdrop" @click=${this.closeDialog}>
          <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
            <h2>Edit Last Event Date</h2>
            <p class="dialog-entity-name">${this.name}</p>

            <input
              type="date"
              class="date-input"
              .value=${this.selectedDate}
              @input=${this.handleDateChange}
            />

            <div class="dialog-actions">
              <button class="cancel-button" @click=${this.closeDialog}>Cancel</button>
              <button class="done-button" @click=${this.markAsDone}>Mark as Done</button>
              <button class="submit-button" @click=${this.submitDate}>Save</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  static styles = css`
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .row:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .icon {
      flex-shrink: 0;
      --mdc-icon-size: 20px;
    }

    .content {
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 6px;
      min-width: 0;
    }

    .name {
      font-weight: 500;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status {
      font-size: 11px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bar-container {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 2px;
    }

    .debug {
      font-size: 10px;
      color: gray;
      margin-top: 4px;
      font-style: italic;
    }

    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      padding: 24px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .dialog h2 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .dialog-entity-name {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .date-input {
      width: 100%;
      padding: 8px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      margin-bottom: 16px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }

    .dialog-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .cancel-button,
    .done-button,
    .submit-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .cancel-button {
      background: transparent;
      color: var(--primary-text-color);
    }

    .cancel-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .done-button {
      background: var(--primary-color, #0da035);
      color: white;
    }

    .done-button:hover {
      background: var(--primary-color-dark, #0b8a2d);
    }

    .submit-button {
      background: var(--secondary-background-color, #333);
      color: var(--primary-text-color);
    }

    .submit-button:hover {
      background: var(--divider-color, #444);
    }
  `;
}
