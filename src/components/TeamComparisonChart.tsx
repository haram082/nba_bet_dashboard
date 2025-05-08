import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { GameData, FilterState } from '../types/types';
import './TeamComparisonChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: GameData[];
  filters: FilterState;
}

// Update the type to include the new comparison option
type ComparisonType = 'home_away' | 'playoff_regular' | 'underdog_favorite';

const TeamComparisonChart: React.FC<Props> = ({ data, filters }) => {
  // Update state type to include the new option
  const [comparisonType, setComparisonType] = useState<ComparisonType>('home_away');

  const filteredData = data.filter(game => 
    game.team_id === filters.selectedTeam &&
    game.season_year === filters.selectedYear.toString()
  );

  const calculateComparisonData = () => {
    let labelA = '';
    let labelB = '';
    let groupA: GameData[] = [];
    let groupB: GameData[] = [];

    if (comparisonType === 'home_away') {
      labelA = 'Home';
      labelB = 'Away';
      groupA = filteredData.filter(game => game.is_home === 't');
      groupB = filteredData.filter(game => game.is_home === 'f');
    } else if (comparisonType === 'playoff_regular') {
      labelA = 'Regular Season';
      labelB = 'Playoffs';
      groupA = filteredData.filter(game => game.season_type === 'Regular Season');
      groupB = filteredData.filter(game => game.season_type === 'Playoffs');
    } else if (comparisonType === 'underdog_favorite') {
      // New comparison type: Underdog vs Favorite
      labelA = 'Favorite';
      labelB = 'Underdog';
      // Favorites have negative moneyline prices
      groupA = filteredData.filter(game => parseFloat(game.moneyline_price) < 0);
      // Underdogs have positive moneyline prices
      groupB = filteredData.filter(game => parseFloat(game.moneyline_price) > 0);
    }

    const calcWinRate = (games: GameData[]) =>
      games.length > 0 ? (games.filter(g => g.wl === 'W').length / games.length) * 100 : 0;

    const calcAvgMoneyline = (games: GameData[]) =>
      games.length > 0 ? games.reduce((acc, g) => acc + parseFloat(g.moneyline_price), 0) / games.length : 0;

    // Calculate average point margin as an additional metric
    const calcAvgPointMargin = (games: GameData[]) =>
      games.length > 0 ? games.reduce((acc, g) => acc + parseFloat(g.point_margin), 0) / games.length : 0;

    return {
      labels: ['Win Rate (%)', 'Average Moneyline', 'Average Point Margin'],
      datasets: [
        {
          label: labelA,
          data: [calcWinRate(groupA), calcAvgMoneyline(groupA), calcAvgPointMargin(groupA)],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: labelB,
          data: [calcWinRate(groupB), calcAvgMoneyline(groupB), calcAvgPointMargin(groupB)],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Team Performance Comparison',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const dataIndex = context.dataIndex;
            
            // Format based on the metric type
            if (dataIndex === 0) {
              return `${label}: ${value.toFixed(1)}%`;
            } else if (dataIndex === 1) {
              return `${label}: ${value.toFixed(0)}`;
            } else if (dataIndex === 2) {
              return `${label}: ${value.toFixed(1)} pts`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any, index: number) {
            // For the moneyline values, add a plus sign to positive values
            if (index === 1 && value > 0) {
              return '+' + value;
            }
            return value;
          }
        }
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <select
          value={comparisonType}
          onChange={(e) => setComparisonType(e.target.value as ComparisonType)}
          className="chart-select"
        >
          <option value="home_away">Home vs Away</option>
          <option value="playoff_regular">Regular Season vs Playoffs</option>
          <option value="underdog_favorite">Underdog vs Favorite</option>
        </select>
      </div>
      <div className="chart-content">
        <Bar data={calculateComparisonData()} options={options} />
      </div>

      {/* Chart caption */}
      <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
        {comparisonType === 'underdog_favorite' ? (
          "This chart compares team performance when they're the favorite (negative moneyline) versus when they're the underdog (positive moneyline). Analyze win rates, average moneylines, and point margins to identify situations where a team exceeds or falls short of expectations."
        ) : comparisonType === 'home_away' ? (
          "This chart compares a team's performance at home versus on the road, showing win rates, average moneylines, and point margins. Use this to identify teams with significant home court advantage or those that perform well as visitors."
        ) : (
          "This chart compares a team's regular season performance against their playoff performance. See how win rates, moneylines, and point margins shift when the stakes are higher in postseason play."
        )}
      </p>
    </div>
  );
};

export default TeamComparisonChart;