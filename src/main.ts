// Import all converted components
import './datetime/DatetimeIcon';
import './datetime/DatetimeLabel';
import './datetime/DatetimeBar';
import './DatetimeCard';
import './DatetimeCardAutocomplete';
import './DatetimeCardEditor';

type CustomCard = {
  type: string;
  name: string;
  preview?: boolean;
  description?: string;
  documentationURL: string;
};

declare global {
  interface Window {
    customCards?: CustomCard[];
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "maintenance-tracker-card",
  name: "Maintenance Tracker Card",
  preview: true,
  description: "Track recurring maintenance tasks like plant watering and filter cleaning",
  documentationURL: "https://github.com/misterdev/datetime-card",
});
