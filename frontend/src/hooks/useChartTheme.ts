import { useMemo } from 'react';

const FALLBACK_CHART_COLORS = ['#FFE500', '#FF4D4D', '#0066FF', '#00FF88', '#FFB800'];

function readCssVar(styles: CSSStyleDeclaration, variableName: string, fallback: string): string {
  const value = styles.getPropertyValue(variableName).trim();
  return value || fallback;
}

export function useChartTheme(): { chartColors: string[] } {
  return useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { chartColors: FALLBACK_CHART_COLORS };
    }

    const styles = getComputedStyle(document.body);
    return {
      chartColors: [
        readCssVar(styles, '--accent-primary', FALLBACK_CHART_COLORS[0]),
        readCssVar(styles, '--accent-secondary', FALLBACK_CHART_COLORS[1]),
        readCssVar(styles, '--accent-tertiary', FALLBACK_CHART_COLORS[2]),
        readCssVar(styles, '--success', FALLBACK_CHART_COLORS[3]),
        readCssVar(styles, '--warning', FALLBACK_CHART_COLORS[4]),
      ],
    };
  }, []);
}
