import { Component, OnInit } from '@angular/core';
import { DataValue } from '../interfaces/dataValue';
import { Frequency } from '../interfaces/frecuency';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements OnInit {

  values: DataValue[] = [];
  value: number;
  graphicValues: number[] = [];
  median = 0;

  tableValues: Frequency[] = [];
  valuesAtX: number[] = [];
  valuesAtY: number[] = [];
  showDotPlot = false;

  // highcharts = Highcharts;
  // chartOptions = {
  //   title : {
  //       text: 'Gráfica de Puntos'
  //   },
  //   yAxis: {
  //     title: {
  //        text: 'Valores'
  //     },
  //     categories: this.valuesAtY
  //   },
  //   xAxis: {
  //     categories: this.valuesAtX
  //   },
  //   series : [{
  //       type: 'scatter',
  //       zoomType: 'xy',
  //       name: 'Valores',
  //       data: this.graphicValues
  //   }]
  // };

  options = {
      chart: {
          type: 'scatterChart',
          height: 450,
          color: d3.scale.category10().range(),
          scatter: {
              onlyCircles: false
          },
          showDistX: true,
          showDistY: true,
          tooltipContent(key) {
              return '<h3>' + key + '</h3>';
          },
          duration: 350,
          xAxis: {
              axisLabel: 'Valores',
              tickFormat(d){
                  return d3.format('.02f')(d);
              }
          },
          yAxis: {
              axisLabel: 'Frecuencia',
              tickFormat(d){
                  return d3.format('.02f')(d);
              },
              axisLabelDistance: -5
          },
          zoom: {
              //NOTE: All attributes below are optional
              enabled: false,
              scaleExtent: [1, 10],
              useFixedDomain: false,
              useNiceScale: false,
              horizontalOff: false,
              verticalOff: false,
              unzoomEventType: 'dblclick.zoom'
          }
      }
  };
  data;

  constructor() { }

  ngOnInit(): void {
  }

  insertValue() {
    this.values.push({ value: this.value });
    this.graphicValues.push(this.value);
  }

  handleFrequencies() {
    let totalValues = 0;
    this.values.forEach(
      data => {
        if (this.tableValues.find(tableData => tableData.value === data.value)) {
          const tableValue = this.tableValues.find(tableData => tableData.value === data.value).f;
          this.tableValues.find(tableData => tableData.value === data.value).f = tableValue + 1;
        } else {
          const frequencyRow: Frequency = {
            value: data.value,
            f: 1
          };
          this.tableValues.push(frequencyRow);
        }
      });
    this.tableValues.forEach(val => totalValues += val.f);
    this.tableValues.forEach(
      (data, index) => {
        data.fr = data.f / totalValues;
        data.fPercent = data.fr * 100;
        if (index === 0) {
          data.fa = data.fPercent;
        } else {
          data.fa = data.fPercent + this.tableValues[index - 1].fa;
        }
      });
    this.handleXAndYValues();
    this.median = this.calculateMedian(this.graphicValues);
    this.data = this.generateData(1);
    this.showDotPlot = true;
  }

  handleXAndYValues() {
    let maxValue = 0;
    this.tableValues.forEach(
      value => {
        this.valuesAtX.push(value.value);
        if (value.f > maxValue) {
          maxValue = value.f;
        }
      });
    console.log(maxValue);

    for (let i = 0; i <= maxValue; i++) {
      this.valuesAtY.push(i);
    }
    console.log(this.valuesAtY);

  }

  formatValue(value: number) {
    return value.toFixed(2);
  }

  calculateMedian(values: number[]){
    if (values.length === 0) { return 0; }

    values.sort((a, b) => {
      return a - b;
    });

    const half = Math.floor(values.length / 2);

    if (values.length % 2) {
      return values[half];
    }

    return (values[half - 1] + values[half]) / 2.0;
  }


generateData(groups) {
    const data = [];
    const shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'];

    for (let i = 0; i < groups; i++) {
        data.push({
            key: 'Grupo ' + i,
            values: []
        });

        for (let j = 0; j < this.tableValues.length; j++) {
            data[i].values.push({
                x: this.tableValues[j].value
                , y: this.tableValues[j].f
                , size: Math.floor(Math.random() * (30 - 20 + 1) + 20)
                , shape: shapes[j % 6]
            });
        }
    }
    return data;
}
}
