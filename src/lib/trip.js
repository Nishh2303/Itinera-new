import { Baby, Landmark, Mountain, ShoppingBag, Sunrise, Trees, Utensils, Waves } from "lucide-react";
import { tripLength } from "./dates.js";

export const styles = [
  { id: "Culture", icon: Landmark },
  { id: "Food", icon: Utensils },
  { id: "Adventure", icon: Mountain },
  { id: "Nature", icon: Trees },
  { id: "Relaxation", icon: Waves },
  { id: "Spiritual", icon: Sunrise },
  { id: "Shopping", icon: ShoppingBag },
  { id: "Family", icon: Baby },
];

export const MAX_DAYS = 14;

export function validate(f) {
  if (!f.destination.trim()) return "Tell us where you're going.";
  if (!f.startDate || !f.endDate) return "Pick your travel dates.";
  const days = tripLength(f.startDate, f.endDate);
  if (days < 1) return "The end date can't be before the start date.";
  if (days > MAX_DAYS) return `Trips can be up to ${MAX_DAYS} days. Try splitting a longer trip.`;
  if (!(Number(f.budget) > 0)) return "Enter a total budget.";
  if (f.preferences.length === 0) return "Choose at least one travel style.";
  return null;
}
