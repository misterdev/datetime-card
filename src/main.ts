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
  type: "datetime-card",
  name: "Datetime Card",
  preview: true,
  description: "Datetime card",
  documentationURL: "https://github.com/a-p-z/datetime-card",
});
