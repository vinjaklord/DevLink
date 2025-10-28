// @/utils/timeFormat.ts
export function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  // Helper to format with unit abbreviation
  const formatUnit = (value: number, unit: string): string => {
    if (value === 1) {
      return `${value}${unit}`;
    }
    return `${value}${unit}`;
  };

  if (diffSeconds < 60) {
    return formatUnit(diffSeconds, 's'); // "5s"
  } else if (diffMinutes < 60) {
    return formatUnit(diffMinutes, 'min'); // "5min"
  } else if (diffHours < 24) {
    return formatUnit(diffHours, 'h'); // "5h"
  } else if (diffDays < 7) {
    return formatUnit(diffDays, 'd'); // "5d"
  } else if (diffWeeks < 52) {
    return formatUnit(diffWeeks, 'w'); // "5w"
  } else {
    return then.toLocaleDateString('en', { month: 'short', day: 'numeric' }); // Fallback: "Oct 15"
  }
}
