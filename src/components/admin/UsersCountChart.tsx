import {
  formatChartDayLabel,
  type UsersCountHistoryPoint,
} from "../../lib/admin-analytics";

type Props = {
  points: UsersCountHistoryPoint[];
  currentCount: number;
  days?: number;
};

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 16, right: 12, bottom: 32, left: 44 };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function buildChartGeometry(
  points: UsersCountHistoryPoint[],
  currentCount: number,
  days: number,
) {
  if (points.length === 0) {
    return null;
  }

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const counts = points.map((p) => p.count);
  const minCount = Math.min(...counts, currentCount);
  const maxCount = Math.max(...counts, currentCount);
  const range = Math.max(maxCount - minCount, 1);

  const minT = points[0].t;
  const maxT = points[0].t + days * MS_PER_DAY;
  const timeRange = Math.max(maxT - minT, MS_PER_DAY);

  const coords = points.map((p) => {
    const x =
      PAD.left + ((p.t + MS_PER_DAY / 2 - minT) / timeRange) * plotW;
    const y =
      PAD.top + plotH - ((p.count - minCount) / range) * plotH;
    return { x, y, ...p };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(PAD.top + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`;

  const yTicks = [minCount, minCount + range / 2, maxCount].map((v) =>
    Math.round(v),
  );

  return { coords, linePath, areaPath, yTicks, plotH, minCount, maxCount };
}

export default function UsersCountChart({
  points,
  currentCount,
  days = 7,
}: Props) {
  const geometry = buildChartGeometry(points, currentCount, days);

  if (!geometry) {
    return (
      <p className="admin-chart__empty">
        Graf će se popuniti nakon nekoliko osvježavanja broja korisnika.
      </p>
    );
  }

  const { coords, linePath, areaPath, yTicks, plotH } = geometry;
  const last = coords[coords.length - 1];

  return (
    <div className="admin-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="admin-chart__svg"
        role="img"
        aria-label={`Graf registracija korisnika — zadnjih ${days} dana`}
      >
        <defs>
          <linearGradient id="usersAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(26, 26, 26, 0.18)" />
            <stop offset="100%" stopColor="rgba(26, 26, 26, 0.02)" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y =
            PAD.top +
            plotH -
            ((tick - geometry.minCount) /
              Math.max(geometry.maxCount - geometry.minCount, 1)) *
              plotH;
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={WIDTH - PAD.right}
                y2={y}
                className="admin-chart__grid"
              />
              <text x={PAD.left - 8} y={y + 4} className="admin-chart__ylabel">
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#usersAreaFill)" />
        <path d={linePath} className="admin-chart__line" fill="none" />

        {coords.map((c) => (
          <circle
            key={c.t}
            cx={c.x}
            cy={c.y}
            r={c.t === last.t ? 5 : 3.5}
            className="admin-chart__dot"
          />
        ))}

        <text
          x={last.x}
          y={Math.max(PAD.top, last.y - 10)}
          className="admin-chart__tip"
          textAnchor="middle"
        >
          {last.count}
        </text>
      </svg>

      <div
        className="admin-chart__axis admin-chart__axis--days"
        style={{
          gridTemplateColumns: `repeat(${coords.length}, minmax(0, 1fr))`,
        }}
      >
        {coords.map((c) => (
          <span key={c.t}>{formatChartDayLabel(c.t)}</span>
        ))}
      </div>
    </div>
  );
}
