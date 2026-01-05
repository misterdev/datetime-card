import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { IEntity, IHass, IDatetimeState, IConfig } from '../types';
import { calculateDatetimeState, formatDateShort, resetDate } from './datetime';

@customElement('datetime-row')
export class DatetimeRow extends LitElement {
  @property({ type: Object }) entity!: IEntity;
  @property({ type: Object }) hass!: IHass;
  @property({ type: Boolean }) debug = false;
  @property({ type: Object }) config!: IConfig;

  @state() private dialogOpen = false;
  @state() private selectedDate = '';
  @state() private showAdvanced = false;

  get state(): IDatetimeState {
    return calculateDatetimeState(this.hass, this.entity);
  }

  get icon(): string {
    // Use custom icon if provided, otherwise fall back to entity's icon or default
    return this.entity.icon ||
           this.hass?.states?.[this.entity?.id]?.attributes?.icon ||
           'mdi:calendar';
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
    return this.state.isOverdue
      ? "rgb(var(--rgb-warning, 223, 76, 30))"
      : "rgb(var(--rgb-success, 13, 160, 53))";
  }

  get statusText(): string {
    const daysUntil = this.state.daysUntilNextEvent;

    // Check if we should show the next date (entity config overrides global config)
    const showNextDate = this.entity.show_next_date ?? this.config?.show_next_date ?? true;

    // Validate date before formatting
    const nextDate = this.state.nextEventDate && !isNaN(this.state.nextEventDate.getTime())
      ? formatDateShort(this.state.nextEventDate)
      : 'Unknown';

    if (this.state.isOverdue) {
      // For overdue, show the date without "Overdue by X days" (that's in the badge)
      return showNextDate ? `Due ${nextDate}` : 'Overdue';
    } else {
      // Simple format: "Due in 5d" or "Due Apr 5 (in 5d)"
      const untilText = daysUntil === 0 ? 'Today' :
                        daysUntil === 1 ? '1d' :
                        `${daysUntil}d`;

      if (showNextDate) {
        return `Due ${nextDate} (in ${untilText})`;
      } else {
        return `Due in ${untilText}`;
      }
    }
  }

  get overdueBadge(): string {
    if (!this.state.isOverdue) return '';
    const overdueDays = Math.abs(this.state.daysUntilNextEvent);
    return overdueDays === 1 ? '1d' : `${overdueDays}d`;
  }

  private handleClick(): void {
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
    this.showAdvanced = false;
  }

  private toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
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
          <div class="name">${this.name}</div>
          <div class="status">${this.statusText}</div>

          ${this.debug ? html`
            <div class="debug">
              Last: ${this.state.lastEventDate.toISOString().split('T')[0]} |
              Next: ${this.state.nextEventDate.toISOString().split('T')[0]} |
              Progress: ${this.barWidth.toFixed(0)}%
            </div>
          ` : ''}
        </div>

        ${this.overdueBadge ? html`
          <span class="overdue-badge">${this.overdueBadge}</span>
        ` : ''}

        <ha-icon
          class="chevron"
          icon="mdi:chevron-right">
        </ha-icon>
      </div>

      ${this.dialogOpen ? html`
        <div class="dialog-backdrop" @click=${this.closeDialog}>
          <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
            <div class="dialog-header">
              <div class="dialog-title">
                <ha-icon .icon=${this.icon} class="dialog-icon"></ha-icon>
                <div>
                  <div class="dialog-entity-name">${this.name}</div>
                  <div class="dialog-subtitle">Last completed: ${formatDateShort(this.state.lastEventDate)}</div>
                </div>
              </div>
              <button class="quick-done-button" @click=${this.markAsDone} title="Mark as done today">
                <ha-icon icon="mdi:check-circle"></ha-icon>
                <span>Done</span>
              </button>
            </div>

            <div class="dialog-body">
              <button class="advanced-toggle" @click=${this.toggleAdvanced}>
                <ha-icon icon="mdi:${this.showAdvanced ? 'chevron-up' : 'chevron-down'}"></ha-icon>
                <span>Advanced: Select custom date</span>
              </button>

              ${this.showAdvanced ? html`
                <div class="advanced-content">
                  <label class="date-label">Select completion date:</label>
                  <input
                    type="date"
                    class="date-input"
                    .value=${this.selectedDate}
                    @input=${this.handleDateChange}
                  />
                  <button class="primary-button full-width" @click=${this.submitDate}>
                    Save Custom Date
                  </button>
                </div>
              ` : ''}
            </div>

            ${!this.showAdvanced ? html`
              <div class="dialog-actions">
                <button class="secondary-button" @click=${this.closeDialog}>Cancel</button>
              </div>
            ` : ''}
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
      padding: 12px;
      cursor: pointer;
      border-radius: var(--ha-card-border-radius, 12px);
      transition: background-color 180ms ease-in-out;
    }

    .row:hover {
      background-color: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.04);
    }

    .icon {
      flex-shrink: 0;
      --mdc-icon-size: 24px;
    }

    .content {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .name {
      font-weight: 500;
      font-size: 15px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .overdue-badge {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      background: rgb(var(--rgb-warning, 223, 76, 30));
      color: white;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--ha-card-border-radius, 12px);
      white-space: nowrap;
      flex-shrink: 0;
      line-height: 1;
    }

    .status {
      font-size: 13px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chevron {
      flex-shrink: 0;
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      opacity: 0.5;
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
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 180ms ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: var(--ha-card-border-radius, 12px);
      min-width: 320px;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      animation: slideUp 180ms ease-in-out;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
      border-bottom: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    }

    .dialog-title {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      flex: 1;
    }

    .dialog-icon {
      flex-shrink: 0;
      --mdc-icon-size: 24px;
      color: var(--primary-color);
    }

    .dialog-entity-name {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }

    .dialog-subtitle {
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .quick-done-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: none;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 180ms ease-in-out;
      white-space: nowrap;
    }

    .quick-done-button:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }

    .quick-done-button ha-icon {
      --mdc-icon-size: 18px;
    }

    .dialog-body {
      padding: 12px 20px;
    }

    .advanced-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px;
      border: none;
      border-radius: var(--ha-card-border-radius, 12px);
      background: transparent;
      color: var(--secondary-text-color);
      font-size: 13px;
      cursor: pointer;
      transition: all 180ms ease-in-out;
      text-align: left;
    }

    .advanced-toggle:hover {
      background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.04);
      color: var(--primary-text-color);
    }

    .advanced-toggle ha-icon {
      --mdc-icon-size: 16px;
    }

    .advanced-content {
      margin-top: 12px;
      animation: slideDown 180ms ease-in-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .date-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    .date-input {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      border: 2px solid var(--divider-color, #ccc);
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      cursor: pointer;
      transition: border-color 180ms ease-in-out;
      box-sizing: border-box;
      margin-bottom: 12px;
    }

    .date-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .dialog-actions {
      display: flex;
      gap: 8px;
      padding: 12px 20px 20px 20px;
      justify-content: flex-end;
    }

    .primary-button,
    .secondary-button {
      padding: 10px 20px;
      border: none;
      border-radius: var(--ha-card-border-radius, 12px);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 180ms ease-in-out;
    }

    .secondary-button {
      background: transparent;
      color: var(--primary-text-color);
    }

    .secondary-button:hover {
      background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.08);
    }

    .primary-button {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
    }

    .primary-button:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }

    .full-width {
      width: 100%;
    }
  `;
}
