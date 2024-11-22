import React, { Component } from "react";
import './Child1.css';
import * as d3 from "d3";

class Child1 extends Component {
  state = {
    company: "Apple",
    selectedMonth: "November",
  };

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.csv_data !== this.props.csv_data ||
      prevState.company !== this.state.company ||
      prevState.selectedMonth !== this.state.selectedMonth
    ) {
      this.renderChart();
    }
  }

  handleCompanyChange = (e) => {
    this.setState({ company: e.target.value });
  };

  handleMonthChange = (e) => {
    this.setState({ selectedMonth: e.target.value });
  };

  filterData = () => {
    const { company, selectedMonth } = this.state;
    return this.props.csv_data.filter(
      (d) =>
        d.Company === company &&
        d.Date.toLocaleString("default", { month: "long" }) === selectedMonth
    );
  };

  renderChart = () => {
    const data = this.filterData();
    const margin = { top: 20, right: 80, bottom: 50, left: 50 }; // Adjusted margin for legend space
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select("#chart").selectAll("*").remove();

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => Math.min(d.Open, d.Close)),
        d3.max(data, (d) => Math.max(d.Open, d.Close)),
      ])
      .nice()
      .range([height, 0]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6));

    svg.append("g").call(d3.axisLeft(y));

    // Lines
    const line = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Open));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#b2df8a")
      .attr("stroke-width", 2)
      .attr("d", line);

    line.y((d) => y(d.Close));
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#e41a1c")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Tooltip
    const tooltip = d3
      .select("#chart")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("display", "none");

    // Points
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.Date))
      .attr("cy", (d) => y(d.Open))
      .attr("r", 5)
      .attr("fill", "#b2df8a")
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `<strong>Date:</strong> ${d.Date.toDateString()}<br>
            <strong>Open:</strong> $${d.Open}<br>
            <strong>Close:</strong> $${d.Close}<br>
            <strong>Difference:</strong> $${(d.Close - d.Open).toFixed(2)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    svg.selectAll(".dot-close")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.Date))
      .attr("cy", (d) => y(d.Close))
      .attr("r", 5)
      .attr("fill", "#e41a1c")
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `<strong>Date:</strong> ${d.Date.toDateString()}<br>
            <strong>Open:</strong> $${d.Open}<br>
            <strong>Close:</strong> $${d.Close}<br>
            <strong>Difference:</strong> $${(d.Close - d.Open).toFixed(2)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    // Legend (move it to the right)
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 20}, ${height / 2 - 180})`);

    // Open Legend - Square
    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#b2df8a")
      .attr("x", 0)
      .attr("y", 0);

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 15)
      .text("Open");

    // Close Legend - Square
    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#e41a1c")
      .attr("x", 0)
      .attr("y", 30);

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 45)
      .text("Close");
  };

  render() {
    return (
      <div>
        <div>
          <h2>Company:</h2>
          {["Apple", "Microsoft", "Amazon", "Google", "Meta"].map((company) => (
            <label key={company}>
              <input
                type="radio"
                value={company}
                checked={this.state.company === company}
                onChange={this.handleCompanyChange}
              />
              {company}
            </label>
          ))}
        </div>
        <div>
          <h2>Month:</h2>
          <select
            value={this.state.selectedMonth}
            onChange={this.handleMonthChange}
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div id="chart"></div>
      </div>
    );
  }
}

export default Child1;
