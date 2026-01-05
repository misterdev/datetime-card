import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { IAutocompleteItem, IConfig, IEntity, IHass } from './types';
import { DraggableEntity } from './draggable-entity';
import './DatetimeCardAutocomplete';

type InputEvent = Event & {
  target: HTMLInputElement;
};

@customElement('datetime-card-editor')
export class DatetimeCardEditor extends LitElement {
  @property({ type: Object }) config!: IConfig;
  @property({ type: Object }) hass!: IHass;

  @state() private isVertical = false;
  @state() private draggableEntities: DraggableEntity[] = [];
  @state() private showMonths = false;
  @state() private image = '';
  @state() private key = 1;
  @state() private isUntilMode = false;
  @state() private reverseOrder = false;
  @state() private filterOverdue = false;
  @state() private showLabels = false;
  @state() private title = '';
  @state() private debug = false;

  // Home Assistant interface method
  setConfig(config: IConfig): void {
    this.config = config;
  }

  get autocompleteItems(): IAutocompleteItem[] {
    return Object.keys(this.hass?.states || {})
      .filter((entity_id) => entity_id.startsWith("input_datetime"))
      .map((entity_id) => this.toAutocompleteItem(entity_id));
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('config')) {
      this.initializeFromConfig();
    }
  }

  private initializeFromConfig(): void {
    this.isVertical = this.config.layout === "vertical";
    this.draggableEntities = this.config.entities?.map((e) => this.toDraggableEntity(e)) || [
      { id: "", key: this.newKey(), threshold: "" },
    ];
    this.showMonths = this.config.show_months || false;
    this.image = this.config.image || "";
    this.isUntilMode = this.config.mode === "until";
    this.reverseOrder = this.config.reverse_order || false;
    this.filterOverdue = this.config.filter_overdue || false;
    this.showLabels = this.config.show_labels || false;
    this.title = this.config.title || "";
    this.debug = this.config.debug || false;
  }

  private addDraggableEntity(): void {
    this.draggableEntities = [...this.draggableEntities, new DraggableEntity(this.newKey())];
  }

  private deleteDraggableEntity(k: number): void {
    this.draggableEntities = this.draggableEntities.filter(({ key }) => key !== k);
    this.dispatchConfigChanged();
  }

  private dispatchConfigChanged(): void {
    const type = "custom:datetime-card";
    const entities = this.draggableEntities.map((e) => this.toEntity(e));
    const layout = this.isVertical ? "vertical" : "horizontal";
    const mode = this.isUntilMode ? "until" : "since";
    const config: IConfig = {
      entities,
      layout,
      reverse_order: this.reverseOrder,
      show_months: this.showMonths,
      image: this.image,
      mode,
      filter_overdue: this.filterOverdue,
      show_labels: this.showLabels,
      title: this.title,
      debug: this.debug,
      type,
    };

    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  private newKey(): number {
    return ++this.key;
  }

  private toAutocompleteItem(entity_id: string): IAutocompleteItem {
    const primaryText = this.hass.states[entity_id].attributes.friendly_name;
    const secondaryText = entity_id;
    return { primaryText, secondaryText, value: entity_id };
  }

  private toDraggableEntity({ friendly_name, id, threshold }: IEntity): DraggableEntity {
    return {
      friendly_name,
      id,
      key: this.newKey(),
      threshold: threshold > 0 ? threshold.toString() : "",
    };
  }

  private toEntity({ friendly_name, id, threshold }: DraggableEntity): IEntity {
    return { friendly_name, id, threshold: parseInt(threshold) || 0 };
  }

  private updateLayout(event: InputEvent): void {
    this.isVertical = event.target.checked;
    this.dispatchConfigChanged();
  }

  private updateId(id: string, entity: DraggableEntity): void {
    this.draggableEntities = this.draggableEntities.map((e) =>
      e === entity ? { ...e, id: id } : e,
    );
    this.dispatchConfigChanged();
  }

  private updateShowMonths(event: InputEvent): void {
    this.showMonths = event.target.checked;
    this.dispatchConfigChanged();
  }

  private updateFriendlyName(event: InputEvent, entity: DraggableEntity): void {
    const friendly_name = event.target.value;
    this.draggableEntities = this.draggableEntities.map((e) =>
      e === entity ? { ...e, friendly_name } : e,
    );
    this.dispatchConfigChanged();
  }

  private updateImage(event: InputEvent): void {
    this.image = event.target.value;
    this.dispatchConfigChanged();
  }

  private updateThreshold(event: InputEvent, entity: DraggableEntity): void {
    const value = Number(event.target.value);

    if (!Number.isInteger(value) || value < 0) {
      event.target.value = entity.threshold;
      return;
    }

    event.target.value = value.toString();
    entity.threshold = value.toString();
    this.dispatchConfigChanged();
  }

  private updateMode(event: InputEvent): void {
    this.isUntilMode = event.target.checked;
    this.dispatchConfigChanged();
  }

  private updateReverseOrder(event: InputEvent): void {
    this.reverseOrder = event.target.checked;
    this.dispatchConfigChanged();
  }

  private updateFilterOverdue(event: InputEvent): void {
    this.filterOverdue = event.target.checked;
    this.dispatchConfigChanged();
  }

  private updateShowLabels(event: InputEvent): void {
    this.showLabels = event.target.checked;
    this.dispatchConfigChanged();
  }

  private updateTitle(event: InputEvent): void {
    this.title = event.target.value;
    this.dispatchConfigChanged();
  }

  private updateDebug(event: InputEvent): void {
    this.debug = event.target.checked;
    this.dispatchConfigChanged();
  }

  render() {
    return html`
      <ha-textfield
        data-testid="title"
        label="Title (optional)"
        .value=${this.title}
        @input=${this.updateTitle}>
      </ha-textfield>

      <ha-textfield
        data-testid="image"
        label="Image (optional)"
        .value=${this.image}
        @input=${this.updateImage}>
      </ha-textfield>

      <section class="switches">
        <ha-switch
          id="vertical-layout-switch"
          aria-label="Vertical layout"
          ?checked=${this.isVertical}
          @change=${this.updateLayout}>
        </ha-switch>
        <label for="vertical-layout-switch">Vertical layout</label>

        <ha-switch
          id="show-months-switch"
          aria-label="Show months"
          ?checked=${this.showMonths}
          @change=${this.updateShowMonths}>
        </ha-switch>
        <label for="show-months-switch">Show months</label>

        <ha-switch
          id="until-mode-switch"
          aria-label="Until mode (countdown)"
          ?checked=${this.isUntilMode}
          @change=${this.updateMode}>
        </ha-switch>
        <label for="until-mode-switch">Until mode (countdown)</label>

        <ha-switch
          id="reverse-order-switch"
          aria-label="Reverse order"
          ?checked=${this.reverseOrder}
          @change=${this.updateReverseOrder}>
        </ha-switch>
        <label for="reverse-order-switch">Reverse order</label>

        <ha-switch
          id="filter-overdue-switch"
          aria-label="Filter overdue only"
          ?checked=${this.filterOverdue}
          @change=${this.updateFilterOverdue}>
        </ha-switch>
        <label for="filter-overdue-switch">Filter overdue only</label>

        <ha-switch
          id="show-labels-switch"
          aria-label="Show labels on bars"
          ?checked=${this.showLabels}
          @change=${this.updateShowLabels}>
        </ha-switch>
        <label for="show-labels-switch">Show labels on bars</label>

        <ha-switch
          id="debug-switch"
          aria-label="Show debug information"
          ?checked=${this.debug}
          @change=${this.updateDebug}>
        </ha-switch>
        <label for="debug-switch">Show debug information</label>
      </section>

      <h3>Entities (required)</h3>

      <section data-testid="entities" class="entities">
        ${repeat(
          this.draggableEntities,
          (entity) => entity.key,
          (entity, index) => html`
            <div role="listitem" class="entity">
              ${this.draggableEntities.length > 1 ? html`
                <div class="handle"></div>
              ` : html`<div class="handle"></div>`}

              <datetime-card-autocomplete
                data-testid="datetime-card-autocomplete-${index}"
                label="Entity"
                .items=${this.autocompleteItems}
                .value=${entity.id}
                .updateId=${(id: string) => this.updateId(id, entity)}>
              </datetime-card-autocomplete>

              <ha-textfield
                data-testid="threshold-${index}"
                class="threshold-textfield"
                label="Threshold (days)"
                .value=${entity.threshold}
                @input=${(event: Event) => this.updateThreshold(event as InputEvent, entity)}>
              </ha-textfield>

              ${this.draggableEntities.length > 1 ? html`
                <ha-icon-button
                  class="delete"
                  data-testid="delete-${index}"
                  role="menuitem"
                  tabindex="0"
                  @click=${() => this.deleteDraggableEntity(entity.key)}>
                  <ha-icon icon="mdi:delete"></ha-icon>
                </ha-icon-button>
              ` : html`<div class="delete"></div>`}

              <div></div>

              <ha-textfield
                data-testid="friendly-name-${index}"
                label="Friendly name"
                .value=${entity.friendly_name || ""}
                @input=${(event: Event) => this.updateFriendlyName(event as InputEvent, entity)}>
              </ha-textfield>
              <div></div>
              <div></div>
            </div>
          `
        )}
      </section>

      <div class="plus">
        <ha-icon-button
          data-testid="plus"
          class="plus"
          role="button"
          tabindex="0"
          @click=${this.addDraggableEntity}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }

    ha-textfield {
      margin-top: 3px;
      margin-bottom: 5px;
    }

    ha-switch {
      margin-left: 30px;
    }

    .delete {
      padding-right: 8px;
      width: 32px;
    }

    .entity {
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      margin-bottom: 5px;
    }

    .handle {
      padding-right: 8px;
      padding-top: 16px;
      width: 32px;
    }

    .threshold-textfield {
      margin: 0 0 0 5px;
      max-width: 60px;
    }

    .plus {
      display: flex;
      justify-content: flex-end;
    }

    .switches {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 6px;
      margin: 16px 0;
    }
  `;
}
