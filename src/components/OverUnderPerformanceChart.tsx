import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { GameData, FilterState } from '../types/types';

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

const OverUnderPerformanceChart: React.FC<Props> = ({ data, filters }) => {
  const filteredData = data.filter(game => 
    game.team_id === filters.selectedTeam &&
    game.season_year === filters.selectedYear.toString()
  );

  const chartData = {
    labels: ['Over', 'Under'],
    datasets: [
      {
        label: 'Performance',
        data: [
          filteredData.filter(game => game.pts + game.opp_pts > game.spread).length,
          filteredData.filter(game => game.pts + game.opp_pts < game.spread).length
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
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
        text: 'Over/Under Performance'
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default OverUnderPerformanceChart; 