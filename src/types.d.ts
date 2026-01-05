export interface IAutocompleteItem {
  primaryText: string;
  secondaryText?: string;
  value: string;
}

export interface IConfig {
  entities?: IEntity[];
  layout?: "horizontal" | "vertical";
  image_position?: "start" | "end";
  image?: string;
  readonly type: "custom:datetime-card";
  filter_overdue?: boolean;
  title?: string;
  debug?: boolean;
}

export interface IDatetimeState {
  daysSinceLastEvent: number;
  daysUntilNextEvent: number;
  nextEventDate: Date;
  lastEventDate: Date;
  isOverdue: boolean;
}

export interface IEntity {
  friendly_name?: string;
  id: string;
  frequency_days: number;
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
