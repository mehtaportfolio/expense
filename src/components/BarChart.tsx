import React, { useState } from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  onBarClick?: (label: string) => void;
}

export function BarChart({
  data,
  title,
  height = 150,
  showValues = true,
  onBarClick
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const rawMax = Math.max(...data.map(d => d.value), 1);
  const maxValue = rawMax * 1.15;
  const barWidth = Math.max(25, Math.min(50, (600 - 140) / data.length - 15));
  const leftMargin = 40;
  const rightMargin = 40;
  const chartWidth = leftMargin + data.length * (barWidth + 15) + rightMargin;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `${lakhs.toFixed(lakhs < 10 ? 1 : 0)}L`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      return `${thousands.toFixed(thousands < 10 ? 1 : 0)}K`;
    } else {
      return amount.toString();
    }
  };

  const handleBarHover = (index: number, x: number, y: number) => {
    setHoveredIndex(index);
    setTooltipPos({ x, y });
  };

  const handleBarLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  return (
    <div className="w-full relative">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="overflow-x-auto w-full">
        <svg
          width={chartWidth}
          height={height + 120}
          viewBox={`0 0 ${chartWidth} ${height + 60}`}
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const value = maxValue * ratio;
            return (
              <g key={i}>
                <text
                  x={leftMargin - 10}
                  y={height - (ratio * height) + 5}
                  textAnchor="end"
                  className="text-xs"
                  style={{ fill: 'var(--text-secondary)' }}
                >
                  {formatCurrency(value)}
                </text>
                <line
                  x1={leftMargin}
                  y1={height - (ratio * height)}
                  x2={chartWidth - rightMargin}
                  y2={height - (ratio * height)}
                  stroke="var(--border-primary)"
                  strokeOpacity={0.3}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * height;
            const x = leftMargin + index * (barWidth + 15);
            const y = height - barHeight;

            return (
              <g 
                key={item.label}
                onMouseEnter={() => handleBarHover(index, x + barWidth / 2, y - 10)}
                onMouseLeave={handleBarLeave}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                  className={`transition-all duration-300 hover:opacity-80 ${onBarClick ? 'cursor-pointer' : 'cursor-default'}`}
                  rx={3}
                  onClick={() => onBarClick?.(item.label)}
                />

                {/* Value label on top of bar */}
                {showValues && item.value > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs font-medium"
                    style={{ fill: 'var(--text-primary)' }}
                  >
                    {formatCurrency(item.value)}
                  </text>
                )}

                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={height + 30}
                  textAnchor="middle"
                  className="text-xs"
                  style={{ fill: 'var(--text-secondary)' }}
                  transform={`rotate(-45, ${x + barWidth / 2}, ${height + 18})`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredIndex !== null && tooltipPos && data[hoveredIndex] && (
        <div
          className="fixed bg-orange-700 dark:bg-gray-100 text-white dark:text-black px-3 py-2 rounded shadow-lg pointer-events-none text-sm font-medium whitespace-nowrap z-50"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 40}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {data[hoveredIndex].value}
        </div>
      )}
    </div>
  );
}