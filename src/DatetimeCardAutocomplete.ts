import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { IAutocompleteItem } from './types';
import { clickOutsideDirective } from './directives/clickoutside-directive';

@customElement('datetime-card-autocomplete')
export class DatetimeCardAutocomplete extends LitElement {
  @property({ type: Array }) items: IAutocompleteItem[] = [];
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: Function }) updateId!: (value: string) => void;

  @state() private filteredItems: IAutocompleteItem[] = [];

  private filter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.updateId(this.value);

    const filterText = this.value.trim().replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");

    if (filterText.length < 3) {
      this.filteredItems = [];
      return;
    }

    const regex = new RegExp(filterText, "gi");

    this.filteredItems = this.items
      .filter((item) => this.test(item, regex))
      .map((item) => this.highlightMatch(item, regex));
  }

  private highlightMatch(item: IAutocompleteItem, regex: RegExp): IAutocompleteItem {
    const primaryText = item.primaryText.replace(
      regex,
      (match: string) => `<strong>${match}</strong>`,
    );

    const secondaryText = item.secondaryText?.replace(
      regex,
      (match: string) => `<strong>${match}</strong>`,
    );

    const value = item.value;

    return { primaryText, secondaryText, value };
  }

  private test(item: IAutocompleteItem, regex: RegExp): boolean {
    return regex.test(item.primaryText) || regex.test(item.secondaryText || '');
  }

  private reset(): void {
    setTimeout(() => (this.filteredItems = []), 100);
  }

  render() {
    return html`
      <ha-textfield
        data-testid="text-field"
        .label=${this.label}
        .value=${this.value}
        @input=${this.filter}>
      </ha-textfield>

      ${this.filteredItems.length > 0 && this.value !== this.filteredItems[0].value
        ? html`
          <ul class="items-list" ${clickOutsideDirective(() => this.reset())}>
            ${this.filteredItems.map(({ primaryText, secondaryText, value }) => html`
              <li
                class="item"
                role="menuitem"
                @click=${() => this.updateId(value)}>
                <span class="primary-text">${unsafeHTML(primaryText)}</span>
                ${secondaryText ? html`
                  <span class="secondary-text">${unsafeHTML(secondaryText)}</span>
                ` : ''}
              </li>
            `)}
          </ul>
        ` : ''}
    `;
  }

  static styles = css`
    :host {
      flex-grow: 1;
      height: 56px;
    }

    ha-textfield {
      width: 100%;
    }

    .items-list {
      margin: 0;
      padding: 0;
      position: relative;
      z-index: 1;
      border-left: 1px solid var(--input-outlined-idle-border-color);
      border-right: 1px solid var(--input-outlined-idle-border-color);
      border-bottom: 1px solid var(--input-outlined-idle-border-color);
    }

    .item {
      display: flex;
      flex-direction: column;
      list-style: none;
      padding: 10px 10px 10px 25px;
      cursor: pointer;
      background-color: var(--material-background-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item:hover {
      background-color: var(--material-secondary-background-color);
    }

    .primary-text {
      color: var(--mdc-dialog-content-ink-color, rgba(0, 0, 0, 0.6));
    }

    .secondary-text {
      font-size: 0.9em;
      color: var(--mdc-text-field-label-ink-color, rgba(0, 0, 0, 0.6));
    }
  `;
}
