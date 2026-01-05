export interface IAutocompleteItem {
  primaryText: string;
  secondaryText?: string;
  value: string;
}

export interface IConfig {
  entities?: IEntity[];
  layout?: "horizontal" | "vertical";
  reverse_order?: boolean;
  show_months?: boolean;
  image?: string;
  readonly type: "custom:datetime-card";
  mode?: "since" | "until";
  filter_overdue?: boolean;
  show_labels?: boolean;
  title?: string;
  debug?: boolean;
}

export interface IEntity {
  friendly_name?: string;
  id: string;
  threshold: number;
}

export interface IHass {
  states: { [key: string]: IState };
}

export interface IState {
  attributes: { [key: string]: string };
  state: string;
}

export interface HaCallServiceButton extends HTMLElement {
  hass: IHass;
  confirmation: string;
  domain: "input_datetime";
  service: "set_datetime";
  data: { entity_id: string; date: string };

  _buttonTapped(): void;
}
