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

const TeamComparisonChart: React.FC<Props> = ({ data, filters }) => {
  const [comparisonType, setComparisonType] = useState<'home_away' | 'playoff_regular'>('home_away');

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
    } else {
      labelA = 'Regular Season';
      labelB = 'Playoffs';
      groupA = filteredData.filter(game => game.season_type === 'Regular Season');
      groupB = filteredData.filter(game => game.season_type === 'Playoffs');
    }

    const calcWinRate = (games: GameData[]) =>
      games.length > 0 ? (games.filter(g => g.wl === 'W').length / games.length) * 100 : 0;

    const calcAvgMoneyline = (games: GameData[]) =>
      games.length > 0 ? games.reduce((acc, g) => acc + parseFloat(g.moneyline_price), 0) / games.length : 0;

    return {
      labels: ['Win Rate (%)', 'Average Moneyline'],
      datasets: [
        {
          label: labelA,
          data: [calcWinRate(groupA), calcAvgMoneyline(groupA)],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: labelB,
          data: [calcWinRate(groupB), calcAvgMoneyline(groupB)],
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
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <select
          value={comparisonType}
          onChange={(e) => setComparisonType(e.target.value as 'home_away' | 'playoff_regular')}
          className="chart-select"
        >
          <option value="home_away">Home vs Away</option>
          <option value="playoff_regular">Regular Season vs Playoffs</option>
        </select>
      </div>
      <div className="chart-content">
        <Bar data={calculateComparisonData()} options={options} />
      </div>

      {/* Optional chart caption */}
      <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
        This chart compares a team's win rate and average moneyline under two different conditions:
        Home vs Away or Regular Season vs Playoffs. Bars for each metric are grouped together for easier comparison.
      </p>
    </div>
  );
};

export default TeamComparisonChart;
