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
    (game.team_id === filters.selectedTeam) &&
    game.season_year === filters.selectedYear.toString()
  );

  const calculateComparisonData = () => {
    if (comparisonType === 'home_away') {
      const homeGames = filteredData.filter(game => game.is_home === 't');
      const awayGames = filteredData.filter(game => game.is_home === 'f');

      return {
        labels: ['Home', 'Away'],
        datasets: [
          {
            label: 'Win Rate',
            data: [
              homeGames.length > 0 ? (homeGames.filter(g => g.wl === 'W').length / homeGames.length) * 100 : 0,
              awayGames.length > 0 ? (awayGames.filter(g => g.wl === 'W').length / awayGames.length) * 100 : 0,
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Average Moneyline',
            data: [
              homeGames.length > 0 ? homeGames.reduce((acc, game) => acc + parseFloat(game.moneyline_price), 0) / homeGames.length : 0,
              awayGames.length > 0 ? awayGames.reduce((acc, game) => acc + parseFloat(game.moneyline_price), 0) / awayGames.length : 0,
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };
    } else {
      const regularGames = filteredData.filter(game => game.season_type === 'Regular Season');
      const playoffGames = filteredData.filter(game => game.season_type === 'Playoffs');

      return {
        labels: ['Regular Season', 'Playoffs'],
        datasets: [
          {
            label: 'Win Rate',
            data: [
              regularGames.length > 0 ? (regularGames.filter(g => g.wl === 'W').length / regularGames.length) * 100 : 0,
              playoffGames.length > 0 ? (playoffGames.filter(g => g.wl === 'W').length / playoffGames.length) * 100 : 0,
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Average Moneyline',
            data: [
              regularGames.length > 0 ? regularGames.reduce((acc, game) => acc + parseFloat(game.moneyline_price), 0) / regularGames.length : 0,
              playoffGames.length > 0 ? playoffGames.reduce((acc, game) => acc + parseFloat(game.moneyline_price), 0) / playoffGames.length : 0,
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };
    }
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
          Here we see how a team compares when either playing at home or away from home and also how they perform in the regular season vs. the playoffs. 
          Win rate is shown as a percentage and moneyline is avergage across the respective assortment of games. 
  
        </p>
    </div>
  );
};

export default TeamComparisonChart; 