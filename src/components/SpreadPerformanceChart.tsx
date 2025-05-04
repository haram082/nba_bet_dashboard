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
import './SpreadPerformanceChart.css';

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

const SpreadPerformanceChart: React.FC<Props> = ({ data, filters }) => {
  const filteredData = data.filter(game => 
    (game.team_id === filters.selectedTeam || game.opp_team_id === filters.selectedTeam) &&
    parseInt(game.season_year) === filters.selectedYear
  );

  const chartData = {
    labels: filteredData.map(game => game.game_date),
    datasets: [
      {
        label: 'Spread',
        data: filteredData.map(game => parseFloat(game.spread)),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Point Margin',
        data: filteredData.map(game => parseFloat(game.point_margin)),
        borderColor: 'rgb(255, 99, 132)',
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
        text: 'Spread vs Point Margin Performance',
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SpreadPerformanceChart; 