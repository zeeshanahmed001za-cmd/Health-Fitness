import { useMemo } from 'react';
import styles from '../styles/CalorieTrendChart.module.css';

/**
 * CalorieTrendChart: A lightweight SVG-based line chart to visualize 7-day intake vs. goal.
 * @param {Array} data - Array of 7 objects: { day, consumed, goal }
 */
const CalorieTrendChart = ({ data = [] }) => {
  const hasData = data.some(d => d.consumed > 0);

  if (!hasData) return <div className={styles.emptyTrendState}>Start logging meals to see your trends.</div>;

  // Chart configuration for professional spacing
  const w = 600;
  const h = 200;
  const padX = 40;
  const padY = 20;
  const maxVal = Math.max(...data.map(d => Math.max(d.consumed, d.goal)), 2500) * 1.1;

  // Helper to normalize Y coordinate with padding
  const getY = (val) => h - padY - (val / maxVal) * (h - padY * 2);

  // Calculate normalized points
  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: getY(d.consumed),
    isOver: d.consumed > d.goal
  }));

  // Cubic Bezier curve Path calculation
  const generateCurve = (pts) => {
    let path = `M ${pts[0].x},${pts[0].y} `;
    for (let i = 0; i < pts.length - 1; i++) {
        const cp1x = pts[i].x + (pts[i+1].x - pts[i].x) / 2;
        const cp2x = cp1x;
        path += `C ${cp1x},${pts[i].y} ${cp2x},${pts[i+1].y} ${pts[i+1].x},${pts[i+1].y} `;
    }
    return path;
  };

  const linePath = generateCurve(points);
  const goalY = getY(data[0].goal);
  const zeroY = getY(0);
  const areaPath = linePath + ` L ${points[points.length-1].x},${zeroY} L ${points[0].x},${zeroY} Z`;

  return (
    <div className={styles.professionalChartContainer}>
      <svg className={styles.mainSvg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="calorieAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal Grid Lines */}
        <line x1={padX} x2={w-padX} y1={zeroY} y2={zeroY} className={styles.horizontalGridLine} />
        <line x1={padX} x2={w-padX} y1={getY(maxVal*0.5)} y2={getY(maxVal*0.5)} className={styles.horizontalGridLine} />

        {/* Goal Reference Line */}
        <line x1={padX} x2={w-padX} y1={goalY} y2={goalY} className={styles.goalRefLine} />

        {/* Area Fill */}
        <path d={areaPath} fill="url(#calorieAreaGradient)" />

        {/* The Smooth Trend Line */}
        <path d={linePath} className={styles.trendPathLine} fill="none" />

        {/* Markers for each day */}
        {points.map((p, i) => (
          <circle 
            key={i} cx={p.x} cy={p.y} r="5" 
            className={`${styles.dataMarker} ${p.isOver ? styles.alertMarker : ''}`} 
          />
        ))}
      </svg>
      
      {/* Properly Spaced X-Axis Labels */}
      <div className={styles.labelsWrapper}>
        {data.map((d, i) => (
          <span key={i} className={styles.axisLabel}>{d.day}</span>
        ))}
      </div>
    </div>
  );
};

export default CalorieTrendChart;
