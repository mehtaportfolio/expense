import React from 'react';

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

export function LineChart({
  data,
  title,
  height = 250,
  showValues = true
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1) * 1.15;
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue;

  const leftMargin = 50;
  const rightMargin = 40;
  const topMargin = 30;
  const bottomMargin = 60;

  const chartWidth = 800;
  const chartHeight = height;
  const svgWidth = chartWidth + leftMargin + rightMargin;
  const svgHeight = chartHeight + topMargin + bottomMargin;

  const pointSpacing = (chartWidth - 20) / (data.length - 1 || 1);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      const lakhs = amount / 100000;
      return `${lakhs.toFixed(lakhs < 10 ? 1 : 1)}L`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      return `${thousands.toFixed(thousands < 10 ? 1 : 1)}K`;
    } else {
      return amount.toFixed(2);
    }
  };

  const points = data.map((item, index) => ({
    x: leftMargin + 10 + index * pointSpacing,
    y: topMargin + chartHeight - ((item.value - minValue) / range) * chartHeight,
    value: item.value,
    label: item.label
  }));

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="overflow-x-auto w-full">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis labels and grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const value = minValue + range * ratio;
            const y = topMargin + chartHeight - ratio * chartHeight;
            return (
              <g key={`y-axis-${i}`}>
                <text
                  x={leftMargin - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs"
                  style={{ fill: 'var(--text-secondary)' }}
                >
                  {formatCurrency(value)}
                </text>
                <line
                  x1={leftMargin}
                  y1={y}
                  x2={leftMargin + chartWidth}
                  y2={y}
                  stroke="var(--border-primary)"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* X-axis */}
          <line
            x1={leftMargin}
            y1={topMargin + chartHeight}
            x2={leftMargin + chartWidth}
            y2={topMargin + chartHeight}
            stroke="var(--border-primary)"
            strokeWidth={2}
          />

          {/* Y-axis */}
          <line
            x1={leftMargin}
            y1={topMargin}
            x2={leftMargin}
            y2={topMargin + chartHeight}
            stroke="var(--border-primary)"
            strokeWidth={2}
          />

          {/* Line path */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(59, 90%, 50%)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points and labels */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              {/* Circle point */}
              <circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill="hsl(59, 90%, 50%)"
                stroke="var(--card-bg)"
                strokeWidth={2}
                className="hover:r-6 transition-all"
              />

              {/* Value label */}
              {showValues && (
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  className="text-xs font-medium"
                  style={{ fill: 'var(--text-primary)' }}
                >
                  {formatCurrency(point.value)}
                </text>
              )}

              {/* X-axis label */}
              <text
                x={point.x}
                y={topMargin + chartHeight + 25}
                textAnchor="middle"
                className="text-xs"
                style={{ fill: 'var(--text-secondary)' }}
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
