import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { GameData, FilterState } from '../types/types';
import './UnderdogFactorsChart.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Props {
  data: GameData[];
  filters: FilterState;
}

const FACTORS: Factor[] = [
  { id: 'fg3_pct', name: '3PT%', threshold: 35, enabled: true, direction: 'gte' },
  { id: 'reb', name: 'Rebounds', threshold: 45, enabled: true, direction: 'gte' },
  { id: 'ast', name: 'Assists', threshold: 25, enabled: true, direction: 'gte' },
  { id: 'tov', name: 'Turnovers', threshold: 12, enabled: true, direction: 'lte' },
  { id: 'ftm', name: 'Free Throws Made', threshold: 18, enabled: true, direction: 'gte' },
  { id: 'fg_pct', name: 'Field Goal %', threshold: 47, enabled: true, direction: 'gte' },
  { id: 'stl', name: 'Steals', threshold: 8, enabled: true, direction: 'gte' },
  { id: 'blk', name: 'Blocks', threshold: 5, enabled: true, direction: 'gte' },
  { id: 'oreb', name: 'Offensive Rebounds', threshold: 12, enabled: true, direction: 'gte' },
  { id: 'dreb', name: 'Defensive Rebounds', threshold: 30, enabled: true, direction: 'gte' },
  { id: 'pts', name: 'Points', threshold: 110, enabled: true, direction: 'gte' },
  { id: 'opp_pts', name: 'Opponent Points', threshold: 100, enabled: true, direction: 'lte' },
  { id: 'pf', name: 'Personal Fouls', threshold: 20, enabled: true, direction: 'lte' },
  { id: 'is_home', name: 'Home Game', threshold: 't', enabled: true, direction: 'eq' },
];

interface Factor {
  id: string;
  name: string;
  threshold: number | string;
  enabled: boolean;
  direction: 'gte' | 'lte' | 'eq';
}

const UnderdogFactorsChart: React.FC<Props> = ({ data, filters }) => {
  const [factors, setFactors] = useState<Factor[]>(FACTORS);

  const filteredData = data.filter(game => 
    (game.team_id === filters.selectedTeam || game.opp_team_id === filters.selectedTeam) &&
    game.season_year === filters.selectedYear.toString() &&
    parseFloat(game.moneyline_price) > 0 // Only underdog games
  );

  const calculateFactorImpact = () => {
    const enabledFactors = factors.filter(f => f.enabled);
    const factorData = enabledFactors.map(factor => {
      let gamesWithFactor: GameData[] = [];
      if (factor.direction === 'eq') {
        gamesWithFactor = filteredData.filter(game => game[factor.id as keyof GameData] === factor.threshold);
      } else {
        const statValue = (game: GameData) => Number(game[factor.id as keyof GameData]);
        gamesWithFactor = filteredData.filter(game =>
          factor.direction === 'gte'
            ? statValue(game) >= Number(factor.threshold)
            : statValue(game) <= Number(factor.threshold)
        );
      }
      const winsWithFactor = gamesWithFactor.filter(game => game.wl === 'W');
      const winRate = gamesWithFactor.length > 0 ? (winsWithFactor.length / gamesWithFactor.length) * 100 : 0;
      return {
        name: factor.name,
        value: winRate,
      };
    });
    return {
      labels: factorData.map(f => f.name),
      datasets: [{
        data: factorData.map(f => f.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(100, 200, 100, 0.5)',
          'rgba(200, 100, 200, 0.5)',
          'rgba(100, 100, 200, 0.5)',
          'rgba(200, 200, 100, 0.5)',
          'rgba(100, 200, 200, 0.5)',
          'rgba(200, 100, 100, 0.5)',
          'rgba(150, 150, 150, 0.5)',
          'rgba(50, 150, 250, 0.5)',
          'rgba(250, 150, 50, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(100, 200, 100, 1)',
          'rgba(200, 100, 200, 1)',
          'rgba(100, 100, 200, 1)',
          'rgba(200, 200, 100, 1)',
          'rgba(100, 200, 200, 1)',
          'rgba(200, 100, 100, 1)',
          'rgba(150, 150, 150, 1)',
          'rgba(50, 150, 250, 1)',
          'rgba(250, 150, 50, 1)',
        ],
        borderWidth: 1,
      }],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Underdog Win Factors Impact',
      },
    },
  };

  const toggleFactor = (factorId: string) => {
    setFactors(factors.map(f => 
      f.id === factorId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  return (
    <div>
      <div className="factors-container">
        {factors.map(factor => (
          <div key={factor.id} className="factor-item">
            <input
              type="checkbox"
              checked={factor.enabled}
              onChange={() => toggleFactor(factor.id)}
              className="factor-checkbox"
            />
            <span className="factor-name">{factor.name}</span>
          </div>
        ))}
      </div>
      <div className="chart-container">
        <Pie data={calculateFactorImpact()} options={options} />
      </div>

      {/* Optional chart caption */}
      <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
          This pie chart shows what factors played a big role in this teams underdog wins for this season.
          Hovering over a slice will show a percentage that represents what percent of the total underdog wins that stat played a big part in;
          "big part" meaning it met a threshold of significance that we determined ourselves. 
  
        </p>
    </div>
  );
};

export default UnderdogFactorsChart; 