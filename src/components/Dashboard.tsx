import React, { useState } from 'react';
import { FilterState, GameData } from '../types/types';
import SpreadPerformanceChart from './SpreadPerformanceChart';
import MoneylineProfitabilityChart from './MoneylineProfitabilityChart';
import UnderdogFactorsChart from './UnderdogFactorsChart';
import TeamComparisonChart from './TeamComparisonChart';
import './Dashboard.css';

const TEAMS = [
  { id: '1610612737', name: 'Atlanta Hawks' },
  { id: '1610612738', name: 'Boston Celtics' },
  { id: '1610612751', name: 'Brooklyn Nets' },
  { id: '1610612766', name: 'Charlotte Hornets' },
  { id: '1610612741', name: 'Chicago Bulls' },
  { id: '1610612739', name: 'Cleveland Cavaliers' },
  { id: '1610612742', name: 'Dallas Mavericks' },
  { id: '1610612743', name: 'Denver Nuggets' },
  { id: '1610612765', name: 'Detroit Pistons' },
  { id: '1610612744', name: 'Golden State Warriors' },
  { id: '1610612745', name: 'Houston Rockets' },
  { id: '1610612754', name: 'Indiana Pacers' },
  { id: '1610612746', name: 'LA Clippers' },
  { id: '1610612747', name: 'Los Angeles Lakers' },
  { id: '1610612763', name: 'Memphis Grizzlies' },
  { id: '1610612748', name: 'Miami Heat' },
  { id: '1610612749', name: 'Milwaukee Bucks' },
  { id: '1610612750', name: 'Minnesota Timberwolves' },
  { id: '1610612740', name: 'New Orleans Pelicans' },
  { id: '1610612752', name: 'New York Knicks' },
  { id: '1610612760', name: 'Oklahoma City Thunder' },
  { id: '1610612753', name: 'Orlando Magic' },
  { id: '1610612755', name: 'Philadelphia 76ers' },
  { id: '1610612756', name: 'Phoenix Suns' },
  { id: '1610612757', name: 'Portland Trail Blazers' },
  { id: '1610612758', name: 'Sacramento Kings' },
  { id: '1610612759', name: 'San Antonio Spurs' },
  { id: '1610612761', name: 'Toronto Raptors' },
  { id: '1610612762', name: 'Utah Jazz' },
  { id: '1610612764', name: 'Washington Wizards' }
];

const Dashboard: React.FC = () => {
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    selectedTeam: '',
    selectedYear: new Date().getFullYear()
  });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  const loadData = async () => {
    if (!tempFilters.selectedTeam) {
      setError('Please select a team');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching CSV file...');
      const response = await fetch('/betting_merged_cleaned.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('CSV loaded, first few lines:', csvText.split('\n').slice(0, 3));
      
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      console.log('CSV Headers:', headers);
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          return headers.reduce((obj: any, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
      
      console.log('Parsed data sample:', data.slice(0, 2));
      console.log('Selected team:', tempFilters.selectedTeam);
      console.log('Selected year:', tempFilters.selectedYear);
      
      const filteredData = data.filter(record => {
        const gameYear = parseInt(record.season_year);
        const isTeamMatch = record.team_id === tempFilters.selectedTeam || record.opp_team_id === tempFilters.selectedTeam;
        
        // Log only if it's close to matching
        if (record.team_id === tempFilters.selectedTeam || 
            record.opp_team_id === tempFilters.selectedTeam || 
            gameYear === tempFilters.selectedYear) {
          console.log('Potential match:', {
            record_team_id: record.team_id,
            record_opp_team_id: record.opp_team_id,
            selected_team: tempFilters.selectedTeam,
            record_season_year: record.season_year,
            selected_year: tempFilters.selectedYear,
            isTeamMatch,
            yearMatch: gameYear === tempFilters.selectedYear
          });
        }
        
        return isTeamMatch && gameYear === tempFilters.selectedYear;
      });
      
      console.log('Total records:', data.length);
      console.log('Filtered data length:', filteredData.length);
      if (filteredData.length === 0) {
        console.log('First few records for debugging:', data.slice(0, 3).map(record => ({
          team_id: record.team_id,
          opp_team_id: record.opp_team_id,
          season_year: record.season_year
        })));
        throw new Error('No data found for the selected filters');
      }
      
      setGameData(filteredData);
      setFilters(tempFilters);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({
      ...prev,
      [name]: name === 'selectedYear' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h1 className="dashboard-title">NBA Betting Dashboard</h1>
          
          {/* Filters */}
          <form onSubmit={handleSubmit} className="filters-container">
            <div className="filters-grid">
              <div className="filter-item">
                <label className="filter-label">Team</label>
                <select
                  name="selectedTeam"
                  className="filter-select"
                  value={tempFilters.selectedTeam}
                  onChange={handleFilterChange}
                >
                  <option value="">Select Team</option>
                  {TEAMS.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-item">
                <label className="filter-label">Season</label>
                <select
                  name="selectedYear"
                  className="filter-select"
                  value={tempFilters.selectedYear}
                  onChange={handleFilterChange}
                >
                  {Array.from({ length: 4 }, (_, i) => 2017 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Loading...' : 'Load Data'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="loading-message">
              <p>Loading data...</p>
            </div>
          )}

          {/* Charts Grid */}
          {!loading && !error && gameData.length > 0 && (
            <div className="charts-grid">
              <div>
                <div className="chart-card">
                  <h2 className="chart-title">Spread Performance</h2>
                  <SpreadPerformanceChart data={gameData} filters={filters} />
                </div>
                <div className="chart-card">
                  <h2 className="chart-title">Moneyline Profitability</h2>
                  <MoneylineProfitabilityChart data={gameData} filters={filters} />
                </div>
              </div>
              
              <div className="chart-card">
                <h2 className="chart-title">Underdog Win Factors</h2>
                <UnderdogFactorsChart data={gameData} filters={filters} />
              </div>
              
              <div className="chart-card">
                <h2 className="chart-title">Team Comparison</h2>
                <TeamComparisonChart data={gameData} filters={filters} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 