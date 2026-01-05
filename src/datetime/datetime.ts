import type { IEntity, IHass, IDatetimeState } from "../types";
import { setDatetimeServiceFactory } from "../hass";

function formatDayString(days: number, formatLabel: boolean): string {
  const sign = days >= 0 ? "" : "-";
  const absoluteDays = Math.abs(days);

  if (!formatLabel || absoluteDays < 30) {
    const dayString = absoluteDays !== 1 ? "days" : "day";
    return `${sign}${absoluteDays} ${dayString}`;
  }

  const months = Math.floor(absoluteDays / 30);
  const remainingDays = absoluteDays % 30;
  const monthString = months !== 1 ? "months" : "month";
  const dayString = remainingDays !== 1 ? "days" : "day";

  if (remainingDays === 0) {
    return `${sign}${months} ${monthString}`;
  }
  return `${sign}${months} ${monthString}, ${remainingDays} ${dayString}`;
}

function calculateDatetimeState(hass: IHass, entity: IEntity): IDatetimeState {
  const entityDate = hass.states?.[entity.id]?.state
    ? new Date(hass.states[entity.id].state)
    : new Date();
  const currentDate = new Date();

  // Set both dates to midnight to compare only the date portion
  entityDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  const differenceInMilliseconds = currentDate.getTime() - entityDate.getTime();
  const daysSinceLastEvent = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  // Validate frequency_days and calculate next event date
  const frequencyDays = entity.frequency_days && entity.frequency_days > 0 ? entity.frequency_days : 7;
  const nextEventDate = new Date(entityDate);
  nextEventDate.setDate(nextEventDate.getDate() + frequencyDays);

  const diffToNext = nextEventDate.getTime() - currentDate.getTime();
  const daysUntilNextEvent = Math.floor(diffToNext / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilNextEvent < 0;

  return {
    daysSinceLastEvent,
    daysUntilNextEvent,
    nextEventDate,
    lastEventDate: entityDate,
    isOverdue,
  };
}

function getState(hass: IHass, entity: IEntity): number {
  const state = calculateDatetimeState(hass, entity);
  return state.daysSinceLastEvent;
}

function isExpired(state: IDatetimeState): boolean {
  return state.isOverdue;
}

function resetDate(
  entity: IEntity,
  eventOrDate: Event | Date,
  hass: IHass,
  skipConfirmation: boolean = false,
): void {
  // Handle Event type (hold-to-reset)
  if (eventOrDate instanceof Event) {
    eventOrDate.stopPropagation();
    eventOrDate.preventDefault();
  }

  const friendly_name = hass.states[entity.id]?.attributes?.friendly_name || 'this item';
  const entity_id = entity.id;

  // Use provided date or default to today
  const targetDate = eventOrDate instanceof Date ? eventOrDate : new Date();

  // If skipConfirmation, call service directly
  if (skipConfirmation) {
    hass.callService('input_datetime', 'set_datetime', {
      entity_id,
      date: format(targetDate),
    });
    return;
  }

  // Otherwise use confirmation dialog
  const confirmation = `Do you want to ${eventOrDate instanceof Date ? 'set' : 'reset'} ${friendly_name} to ${format(targetDate)}?`;
  const element = setDatetimeServiceFactory(
    hass,
    confirmation,
    entity_id,
    format(targetDate),
  );

  // Use document.body to avoid shadow DOM issues
  document.body.appendChild(element);
  element._buttonTapped();

  // Remove element after a delay to allow service call to complete
  setTimeout(() => {
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  }, 100);
}

function format(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthPadded = month.toString().padStart(2, "0");
  const dayPadded = day.toString().padStart(2, "0");
  return `${year}-${monthPadded}-${dayPadded}`;
}

function formatDateShort(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  // Check if date is today
  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export { formatDayString, getState, isExpired, resetDate, calculateDatetimeState, formatDateShort };
