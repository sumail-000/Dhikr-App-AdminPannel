import { useMemo } from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface SimpleChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'area';
  height?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
}

export function SimpleChart({
  data,
  type,
  height = 200,
  className = '',
  showLabels = true,
  showValues = false,
}: SimpleChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const range = maxValue - minValue || 1;

  const getBarHeight = (value: number) => {
    return ((value - minValue) / range) * (height - 40);
  };

  const getLinePoints = () => {
    const width = 100 / (data.length - 1 || 1);
    return data
      .map((point, index) => {
        const x = index * width;
        const y = height - 20 - getBarHeight(point.value);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const getAreaPath = () => {
    const width = 100 / (data.length - 1 || 1);
    let path = `M 0,${height - 20}`;
    
    data.forEach((point, index) => {
      const x = index * width;
      const y = height - 20 - getBarHeight(point.value);
      if (index === 0) {
        path += ` L ${x},${y}`;
      } else {
        path += ` L ${x},${y}`;
      }
    });
    
    path += ` L ${(data.length - 1) * width},${height - 20} Z`;
    return path;
  };

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {type === 'bar' && (
            <>
              {data.map((point, index) => {
                const barWidth = 80 / data.length;
                const x = (index * 100) / data.length + (100 / data.length - barWidth) / 2;
                const barHeight = getBarHeight(point.value);
                
                return (
                  <g key={index}>
                    <rect
                      x={x}
                      y={height - 20 - barHeight}
                      width={barWidth}
                      height={barHeight}
                      fill={point.color || '#3B82F6'}
                      className="hover:opacity-80 transition-opacity"
                    />
                    {showValues && (
                      <text
                        x={x + barWidth / 2}
                        y={height - 25 - barHeight}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                        fontSize="3"
                      >
                        {point.value}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {type === 'line' && (
            <>
              <polyline
                points={getLinePoints()}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.5"
                className="drop-shadow-sm"
              />
              {data.map((point, index) => {
                const width = 100 / (data.length - 1 || 1);
                const x = index * width;
                const y = height - 20 - getBarHeight(point.value);
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="1"
                    fill={point.color || '#3B82F6'}
                    className="hover:r-1.5 transition-all"
                  />
                );
              })}
            </>
          )}

          {type === 'area' && (
            <>
              <path
                d={getAreaPath()}
                fill="url(#areaGradient)"
                stroke="#3B82F6"
                strokeWidth="0.5"
              />
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </>
          )}
        </svg>

        {showLabels && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {data.map((point, index) => (
              <span key={index} className="text-center" style={{ width: `${100 / data.length}%` }}>
                {point.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple pie chart component
export interface PieChartProps {
  data: ChartDataPoint[];
  size?: number;
  className?: string;
  showLegend?: boolean;
}

export function SimplePieChart({
  data,
  size = 200,
  className = '',
  showLegend = true,
}: PieChartProps) {
  // Filter out zero values for pie chart calculation
  const nonZeroData = useMemo(() => data.filter(item => item.value > 0), [data]);
  const total = useMemo(() => nonZeroData.reduce((sum, item) => sum + item.value, 0), [nonZeroData]);
  
  // Debug logging (only in dev mode)
  if (import.meta.env.DEV && data.length > 0) {
    console.log('SimplePieChart received data:', data, 'Non-zero data:', nonZeroData, 'Total:', total);
  }
  
  const segments = useMemo(() => {
    let currentAngle = 0;
    return nonZeroData.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
      const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
      const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Handle full circle case (100% of data)
      const path = percentage === 100 
        ? `M 50,10 A 40,40 0 1,1 49.99,10 Z` // Full circle
        : `M 50,50 L ${x1},${y1} A 40,40 0 ${largeArcFlag},1 ${x2},${y2} Z`;
      
      return {
        ...item,
        percentage,
        path,
        color: item.color || `hsl(${(index * 360) / nonZeroData.length}, 70%, 50%)`,
      };
    });
  }, [nonZeroData, total]);

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height: size }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-center">
        <svg width={size} height={size} viewBox="0 0 100 100">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              title={`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}
            />
          ))}
        </svg>
      </div>
      
      {showLegend && (
        <div className="mt-4 space-y-2">
          {/* Show all data in legend, including zeros */}
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)` }}
                />
                <span className="text-gray-700">{item.label}</span>
              </div>
              <span className="text-gray-500">
                {item.value} {item.value > 0 && total > 0 ? `(${((item.value / total) * 100).toFixed(1)}%)` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}