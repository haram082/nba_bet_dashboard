import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GameData, FilterState } from '../types/types';
import './UnderdogFactorsChart.css';

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

interface Factor {
  id: string;
  name: string;
  threshold: number | string;
  enabled: boolean;
  direction: 'gte' | 'lte' | 'eq';
}

interface FactorImpact {
  name: string;
  displayName: string;
  value: number; // Win rate when threshold is met
  color: string;
  borderColor: string;
  meetsThreshold: number; // Number of games that meet the threshold
  winsWithFactor: number; // Number of wins when meeting threshold
  totalUnderdogGames: number;
  thresholdPercentage: number; // % of underdog games meeting the threshold
}

const FACTORS: Factor[] = [
  { id: 'fg3_pct', name: '3PT%', threshold: 0.35, enabled: true, direction: 'gte' },
  { id: 'reb', name: 'Rebounds', threshold: 42, enabled: true, direction: 'gte' },
  { id: 'ast', name: 'Assists', threshold: 25, enabled: true, direction: 'gte' },
  { id: 'tov', name: 'Turnovers', threshold: 15, enabled: true, direction: 'lte' },
  { id: 'ftm', name: 'Free Throws Made', threshold: 20, enabled: true, direction: 'gte' },
  { id: 'fg_pct', name: 'Field Goal %', threshold: 0.45, enabled: true, direction: 'gte' },
  { id: 'stl', name: 'Steals', threshold: 8, enabled: true, direction: 'gte' },
  { id: 'blk', name: 'Blocks', threshold: 5, enabled: true, direction: 'gte' },
  { id: 'oreb', name: 'Offensive Rebounds', threshold: 12, enabled: true, direction: 'gte' },
  { id: 'dreb', name: 'Defensive Rebounds', threshold: 30, enabled: true, direction: 'gte' },
  { id: 'pts', name: 'Points', threshold: 110, enabled: true, direction: 'gte' },
  { id: 'opp_pts', name: 'Opponent Points', threshold: 100, enabled: true, direction: 'lte' },
  { id: 'pf', name: 'Personal Fouls', threshold: 20, enabled: true, direction: 'lte' },
  { id: 'is_home', name: 'Home Game', threshold: 't', enabled: true, direction: 'eq' },
];

// Function to get color based on win rate percentage
const getColorForPercentage = (percentage: number): { bg: string, border: string } => {
  if (percentage >= 70) {
    return { bg: 'rgba(0, 176, 80, 0.7)', border: 'rgba(0, 150, 64, 1)' }; // Very strong - Green
  } else if (percentage >= 60) {
    return { bg: 'rgba(0, 176, 240, 0.7)', border: 'rgba(0, 150, 200, 1)' }; // Strong - Blue
  } else if (percentage >= 50) {
    return { bg: 'rgba(255, 192, 0, 0.7)', border: 'rgba(230, 175, 0, 1)' }; // Moderate - Gold
  } else if (percentage >= 40) {
    return { bg: 'rgba(255, 153, 0, 0.7)', border: 'rgba(230, 138, 0, 1)' }; // Slight positive - Orange
  } else if (percentage >= 30) {
    return { bg: 'rgba(255, 102, 0, 0.7)', border: 'rgba(230, 92, 0, 1)' }; // Neutral - Light Orange
  } else {
    return { bg: 'rgba(255, 0, 0, 0.7)', border: 'rgba(230, 0, 0, 1)' }; // Negative - Red
  }
};

const getOperatorSymbol = (direction: string): string => {
  switch (direction) {
    case 'gte': return '≥';
    case 'lte': return '≤';
    case 'eq': return '=';
    default: return '';
  }
};

const getDisplayName = (factor: Factor): string => {
  if (factor.id === 'is_home') {
    return 'Home Game';
  }
  const operator = getOperatorSymbol(factor.direction);
  return `${factor.name} ${operator} ${factor.threshold}`;
};

const UnderdogFactorsChart: React.FC<Props> = ({ data, filters }) => {
  const [factors, setFactors] = useState<Factor[]>(FACTORS);
  
  // Filter for only underdog games
  const filteredData = data.filter(game => 
    (game.team_id === filters.selectedTeam) &&
    game.season_year === filters.selectedYear.toString() &&
    parseFloat(game.moneyline_price) > 0 // Only underdog games
  );
  
  const totalUnderdogGames = filteredData.length;

  const calculateFactorImpact = () => {
    const enabledFactors = factors.filter(f => f.enabled);
    const factorImpacts: FactorImpact[] = enabledFactors.map(factor => {
      // For each factor, find games where the factor threshold was met
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
      
      // Calculate win rate as wins with factor / games meeting threshold
      const winsWithFactor = gamesWithFactor.filter(game => game.wl === 'W');
      const winRate = gamesWithFactor.length > 0 ? (winsWithFactor.length / gamesWithFactor.length) * 100 : 0;
      const thresholdPercentage = totalUnderdogGames > 0 ? (gamesWithFactor.length / totalUnderdogGames) * 100 : 0;
      
      const colorSet = getColorForPercentage(winRate);
      
      return {
        name: factor.name,
        displayName: getDisplayName(factor),
        value: winRate,
        color: colorSet.bg,
        borderColor: colorSet.border,
        meetsThreshold: gamesWithFactor.length,
        winsWithFactor: winsWithFactor.length,
        totalUnderdogGames,
        thresholdPercentage
      };
    });

    // Sort factors by win rate (descending)
    const sortedFactors = [...factorImpacts].sort((a, b) => b.value - a.value);
    
    const chartData = {
      labels: sortedFactors.map(f => f.displayName),
      datasets: [{
        label: 'Win %',
        data: sortedFactors.map(f => f.value),
        backgroundColor: sortedFactors.map(f => f.color),
        borderColor: sortedFactors.map(f => f.borderColor),
        borderWidth: 1,
      }],
    };

    return { sortedFactors, chartData };
  };

  const { sortedFactors, chartData } = calculateFactorImpact();

  const toggleFactor = (factorId: string) => {
    setFactors(factors.map(f => 
      f.id === factorId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  // Color legend explanation
  const colorLegend = [
    { range: "70%+", color: "rgba(0, 176, 80, 0.7)" },
    { range: "60-69%", color: "rgba(0, 176, 240, 0.7)" },
    { range: "50-59%", color: "rgba(255, 192, 0, 0.7)" },
    { range: "40-49%", color: "rgba(255, 153, 0, 0.7)" },
    { range: "30-39%", color: "rgba(255, 102, 0, 0.7)" },
    { range: "<30%", color: "rgba(255, 0, 0, 0.7)" }
  ];

  return (
    <div className="underdogFactors-container">
      <div className="chart-header">
        <h3 className="chart-explanation">
          Win rate when threshold is met ({totalUnderdogGames} total underdog games)
        </h3>
      </div>
      
      <div className="chart-controls">
        <div className="factors-container">
          {factors.map(factor => (
            <div key={factor.id} className="factor-item">
              <input
                type="checkbox"
                checked={factor.enabled}
                onChange={() => toggleFactor(factor.id)}
                className="factor-checkbox"
                id={`factor-${factor.id}`}
              />
              <label htmlFor={`factor-${factor.id}`} className="factor-name">
                {getDisplayName(factor)}
              </label>
            </div>
          ))}
        </div>
        
        <div className="color-legend">
          <div className="legend-title">Win Rate</div>
          <div className="legend-items">
            {colorLegend.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="color-box" style={{ backgroundColor: item.color }}></div>
                <div className="legend-label">{item.range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <Bar 
          data={chartData} 
          options={{
            indexAxis: 'y' as const,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const index = context.dataIndex;
                    const factor = sortedFactors[index];
                    return [
                      `Win Rate: ${factor.value.toFixed(1)}% when threshold met`,
                      `${factor.winsWithFactor} wins out of ${factor.meetsThreshold} games meeting threshold`,
                      `(${factor.thresholdPercentage.toFixed(1)}% of underdog games meet this threshold)`
                    ];
                  }
                }
              },
              title: {
                display: true,
                text: 'Underdog Win Factors (Win Rate When Threshold Met)',
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              },
              y: {
                grid: {
                  display: false
                }
              }
            }
          }}
          height={500}
        />
      </div>

      <div className="chart-header">
        <h3 className="chart-explanation">
          Win rate when threshold is met ({totalUnderdogGames} total underdog games)
        </h3>
        <div className="chart-caption">
          This chart analyzes which statistical thresholds best predict upsets by calculating the win percentage
          for underdog games (teams with positive moneyline odds) when each factor occurs. For example, "3PT% ≥ 35" 
          shows the percentage of games won when the team shot 35% or better from three-point range as an underdog. 
          Win rates are calculated as (wins with factor ÷ games meeting threshold) × 100. Each factor is tested 
          independently to identify which statistical benchmarks most reliably signal potential upset victories.
        </div>
      </div>

    </div>
  );
};

export default UnderdogFactorsChart;