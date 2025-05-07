import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FilterState, GameData } from '../types/types';
import './SpreadPerformanceChart.css'; 

interface Props {
  filters: FilterState;
  data: GameData[]; 
}

const SpreadPerformanceChart: React.FC<Props> = ({ filters, data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data.length) return;

    const processed = data
      .filter(d => d.team_id === filters.selectedTeam)
      .map(d => ({
      ...d,
      date: new Date(d.game_date),
      open: -parseFloat(d.spread),
      close: parseFloat(d.point_margin),
      }))
      .sort((a, b) => new Date(a.game_date).getTime() - new Date(b.game_date).getTime());

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3
      .scaleBand<Date>()
      .domain(processed.map(d => new Date(d.game_date)))
      .range([0, width])
      .padding(0.4);

    
    const yMin = d3.min(processed, d => Math.min(-parseFloat(d.spread), parseFloat(d.point_margin))) || -10;
    const yMax = d3.max(processed, d => Math.max(-parseFloat(d.spread), parseFloat(d.point_margin))) || 10;
    
    const y = d3
      .scaleLinear()
      .domain([yMin - 5, yMax + 5])
      .nice()
      .range([height, 0]);

    // Add x-axis with rotated labels
    chart
      .append('g')
      .attr('class', 'x-axis')
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

    // Add y-axis
    chart
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Add y-axis label
    chart
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .style('font-size', '12px')
      .text('Point Differential');

    // Add reference line at y=0
    chart
      .append('line')
      .attr('class', 'reference-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Set up tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Draw candlesticks
    chart
      .selectAll('.candle')
      .data(processed)
      .enter()
      .append('line')
      .attr('class', 'candle')
      .attr('x1', d => (x(new Date(d.game_date)) || 0) + x.bandwidth() / 2)
      .attr('x2', d => (x(new Date(d.game_date)) || 0) + x.bandwidth() / 2)
      .attr('y1', d => y(-parseFloat(d.spread)))
      .attr('y2', d => y(parseFloat(d.point_margin)))
      .attr('stroke', d => parseFloat(d.point_margin) > -parseFloat(d.spread) ? "green" : "red")
      .attr('stroke-width', 4)
      .on('mouseover', function (event, d) {
        tooltip
          .style('visibility', 'visible')
          .html(
            `<strong>${d.game_date}</strong><br/>
             Matchup: ${d.matchup}<br/>
             Spread: ${d.spread}<br/>
             Margin: ${d.point_margin}<br/>
             ${parseFloat(d.point_margin) > -parseFloat(d.spread) ? 'Beat the Spread' : 'Failed to Beat the Spread'}`
          );
        d3.select(this).attr('stroke-width', 6);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('top', '5%')
          .style('left', '20%');
      })
      .on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
        d3.select(this).attr('stroke-width', 4);
      });

    // Add chart title
    chart
      .append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Spread vs. Actual Performance');

  }, [data, filters]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={960} height={500}></svg>

       {/* Optional chart caption */}
        <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
          This chart shows how the selected team performed relative to the betting spread across the selected season. (A spread of -5.0 means that team is projected to win by 5 points)
          On hovering, the viewer will see the actual spread and point margin, but for the purpose of the candlestick, spread is flips sign in the position of the graph. 
          
        </p>
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
          zIndex: 1000
        }}
      ></div>
    </div>
  );
};

export default SpreadPerformanceChart;