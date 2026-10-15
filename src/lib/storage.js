// Keeps the last plan so a refresh doesn't lose it. Best-effort only.
const KEY = "itinera:last-plan:v2";

export const loadPlan = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

export const savePlan = (plan) => {
  try {
    if (plan) localStorage.setItem(KEY, JSON.stringify(plan));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
};
