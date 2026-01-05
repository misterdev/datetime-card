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

  @state() private layout: "horizontal" | "vertical" = "horizontal";
  @state() private draggableEntities: DraggableEntity[] = [];
  @state() private image = '';
  @state() private key = 1;
  @state() private imagePosition: "start" | "end" = "start";
  @state() private filterOverdue = false;
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
    this.layout = this.config.layout || "horizontal";
    this.draggableEntities = this.config.entities?.map((e) => this.toDraggableEntity(e)) || [
      { id: "", key: this.newKey(), frequency_days: "" },
    ];
    this.image = this.config.image || "";
    this.imagePosition = this.config.image_position || "start";
    this.filterOverdue = this.config.filter_overdue || false;
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
    const config: IConfig = {
      entities,
      layout: this.layout,
      image_position: this.imagePosition,
      image: this.image,
      filter_overdue: this.filterOverdue,
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

  private toDraggableEntity({ friendly_name, id, frequency_days }: IEntity): DraggableEntity {
    return {
      friendly_name,
      id,
      key: this.newKey(),
      frequency_days: frequency_days > 0 ? frequency_days.toString() : "",
    };
  }

  private toEntity({ friendly_name, id, frequency_days }: DraggableEntity): IEntity {
    return {
      friendly_name,
      id,
      frequency_days: parseInt(frequency_days) || 7,
    };
  }

  private updateLayout(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.layout = select.value as "horizontal" | "vertical";
    this.dispatchConfigChanged();
  }

  private updateId(id: string, entity: DraggableEntity): void {
    this.draggableEntities = this.draggableEntities.map((e) =>
      e === entity ? { ...e, id: id } : e,
    );
    this.dispatchConfigChanged();
  }

  private updateImagePosition(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.imagePosition = select.value as "start" | "end";
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

  private updateFrequency(event: InputEvent, entity: DraggableEntity): void {
    const value = Number(event.target.value);

    if (!Number.isInteger(value) || value < 1) {
      event.target.value = entity.frequency_days;
      return;
    }

    event.target.value = value.toString();
    entity.frequency_days = value.toString();
    this.dispatchConfigChanged();
  }

  private updateFilterOverdue(event: InputEvent): void {
    this.filterOverdue = event.target.checked;
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

      <section class="options">
        <div class="option-row">
          <label for="layout-select">Layout</label>
          <select
            id="layout-select"
            class="select"
            .value=${this.layout}
            @change=${this.updateLayout}>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>

        <div class="option-row">
          <label for="image-position-select">Image Position</label>
          <select
            id="image-position-select"
            class="select"
            .value=${this.imagePosition}
            @change=${this.updateImagePosition}>
            <option value="start">${this.layout === "vertical" ? "Top" : "Left"}</option>
            <option value="end">${this.layout === "vertical" ? "Bottom" : "Right"}</option>
          </select>
        </div>

        <div class="option-row">
          <ha-switch
            id="filter-overdue-switch"
            aria-label="Filter overdue only"
            ?checked=${this.filterOverdue}
            @change=${this.updateFilterOverdue}>
          </ha-switch>
          <label for="filter-overdue-switch">Filter overdue only</label>
        </div>

        <div class="option-row">
          <ha-switch
            id="debug-switch"
            aria-label="Show debug information"
            ?checked=${this.debug}
            @change=${this.updateDebug}>
          </ha-switch>
          <label for="debug-switch">Show debug information</label>
        </div>
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
                data-testid="frequency-${index}"
                class="frequency-textfield"
                label="Frequency (days)"
                .value=${entity.frequency_days}
                @input=${(event: Event) => this.updateFrequency(event as InputEvent, entity)}>
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

    .frequency-textfield {
      margin: 0 0 0 5px;
      max-width: 80px;
    }

    .plus {
      display: flex;
      justify-content: flex-end;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option-row label {
      flex: 0 0 140px;
    }

    .select {
      flex: 1;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 14px;
    }
  `;
}
