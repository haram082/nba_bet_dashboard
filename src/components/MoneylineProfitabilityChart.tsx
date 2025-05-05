import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { GameData, FilterState } from '../types/types';
import './MoneylineProfitabilityChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: GameData[];
  filters: FilterState;
}

const MoneylineProfitabilityChart: React.FC<Props> = ({ data, filters }) => {
  const filteredData = data
    .filter(game => 
      (game.team_id === filters.selectedTeam || game.opp_team_id === filters.selectedTeam) &&
      game.season_year === filters.selectedYear.toString() &&
      parseFloat(game.moneyline_price) > 0 // Only underdog games
    )
    .sort((a, b) => new Date(a.game_date).getTime() - new Date(b.game_date).getTime()); // Sort by date

  // Calculate cumulative profit
  let cumulativeProfit = 0;
  const profitData = filteredData.map(game => {
    const betAmount = 1; // 1 unit
    const profit = game.wl === 'W' 
      ? (parseFloat(game.moneyline_price) > 0 ? parseFloat(game.moneyline_price) / 100 : 1) * betAmount
      : -betAmount;
    cumulativeProfit += profit;
    return cumulativeProfit;
  });

  const chartData = {
    labels: filteredData.map(game => game.game_date),
    datasets: [
      {
        label: 'Cumulative Profit (Units)',
        data: profitData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Moneyline Betting Profitability',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Profit (Units)',
        },
      },
    },
  };

  // Calculate statistics
  const totalGames = filteredData.length;
  const wins = filteredData.filter(game => game.wl === 'W').length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const totalProfit = profitData[profitData.length - 1] || 0;

  return (
    <div>
      <div className="chart-container">
        <Line
          data={chartData}
          options={options}
          height={350}
          width={600}
        />
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-value">{winRate.toFixed(1)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Games</div>
          <div className="stat-value">{totalGames}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Profit</div>
          <div className="stat-value">{totalProfit.toFixed(2)} units</div>
        </div>
      </div>
    </div>
  );
};

export default MoneylineProfitabilityChart; 