// SpreadPerformanceChart.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FilterState } from '../types/types';
import './SpreadPerformanceChart.css';

interface Props {
  filters: FilterState;
}

interface GameRecord {
  game_date: string;
  team_id: string;
  season: string;
  season_year: string;
  spread: string;
  point_margin: string;
  matchup: string;
}

const SpreadPerformanceChart: React.FC<Props> = ({ filters }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<GameRecord[]>([]);

  useEffect(() => {
    d3.csv('/betting_merged_cleaned_flipped_spread.csv').then((loadedData) => {
      setData(loadedData as GameRecord[]);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const filtered = data
      .filter(
        (d) =>
          d.team_id === filters.selectedTeam &&
          d.season === filters.selectedYear.toString()
      )
      .map((d) => ({
        ...d,
        date: new Date(d.game_date),
        open: +d.spread,
        close: +d.point_margin,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand<Date>()
      .domain(filtered.map((d) => d.date))
      .range([0, width])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(filtered, (d) => Math.min(d.open, d.close))! - 5,
        d3.max(filtered, (d) => Math.max(d.open, d.close))! + 5,
      ])
      .nice()
      .range([height, 0]);

    chart
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat(d3.timeFormat('%b %d') as any)
          .tickValues(x.domain().filter((_, i) => i % 5 === 0))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    chart.append('g').call(d3.axisLeft(y));

    const tooltip = d3.select(tooltipRef.current);

    chart
      .selectAll('.candle')
      .data(filtered)
      .enter()
      .append('line')
      .attr('class', 'candle')
      .attr('x1', (d) => x(d.date)! + x.bandwidth() / 2)
      .attr('x2', (d) => x(d.date)! + x.bandwidth() / 2)
      .attr('y1', (d) => y(d.open))
      .attr('y2', (d) => y(d.close))
      .attr('stroke', (d) => (d.close > d.open ? 'green' : 'red'))
      .attr('stroke-width', 4)
      .on('mouseover', function (event, d) {
        tooltip
          .style('visibility', 'visible')
          .html(
            `<strong>${d.game_date}</strong><br/>
             Matchup: ${d.matchup}<br/>
             Spread: ${d.spread}<br/>
             Margin: ${d.point_margin}`
          );
        d3.select(this).attr('stroke-width', 6);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('top', event.pageY - 40 + 'px')
          .style('left', event.pageX + 10 + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
        d3.select(this).attr('stroke-width', 4);
      });
  }, [data, filters]);

  return (
    <div style={{ position: 'relative' }}>
      <h2>NBA Spread vs. Point Margin Candlestick Chart</h2>
      <svg ref={svgRef} width={960} height={500}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          background: 'white',
          border: '1px solid #ccc',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none',
          boxShadow: '0px 0px 5px rgba(0,0,0,0.1)',
        }}
      ></div>
    </div>
  );
};

export default SpreadPerformanceChart;
