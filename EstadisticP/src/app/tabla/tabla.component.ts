import { Component, OnInit } from '@angular/core';
import { DataValue } from '../interfaces/dataValue';
import { Frequency } from '../interfaces/frecuency';
import * as Highcharts from 'highcharts';
import * as arraystat from 'arraystat';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css'],
})
export class TablaComponent implements OnInit {
  values: DataValue[] = [];
  value: number;
  graphicValues: number[] = [];
  median = 0;
  moda = 0;
  media = 0;
  tableValues: Frequency[] = [];
  tableIntervalValues: Frequency[] = [];
  valuesAtX: number[] = [];
  valuesAtY: number[] = [];
  showDotPlot = false;

  isFrequencyTable = true;
  isIntervalsTable = false;
  isDotPlot = false;
  isBoxPlot = false;

  options = {
    chart: {
      type: 'scatterChart',
      height: 450,
      color: d3.scale.category10().range(),
      scatter: {
        onlyCircles: false,
      },
      showDistX: true,
      showDistY: true,
      tooltipContent(key) {
        return '<h3>' + key + '</h3>';
      },
      duration: 350,
      xAxis: {
        axisLabel: 'Valores',
        tickFormat(d) {
          return d3.format('.02f')(d);
        },
      },
      yAxis: {
        axisLabel: 'Frecuencia',
        tickFormat(d) {
          return d3.format('.02f')(d);
        },
        axisLabelDistance: -5,
      },
      zoom: {
        enabled: false,
        scaleExtent: [1, 10],
        useFixedDomain: false,
        useNiceScale: false,
        horizontalOff: false,
        verticalOff: false,
        unzoomEventType: 'dblclick.zoom',
      },
    },
  };
  data: any;

  optionsCaja = {
    chart: {
        type: 'boxPlotChart',
        height: 450,
        margin : {
            top: 20,
            right: 20,
            bottom: 60,
            left: 40
        },
        color: ['darkblue', 'darkorange', 'green', 'darkred', 'darkviolet'],
        x(d){return d.label; },
        maxBoxWidth: 75,
        yDomain: [0, 500]
    }
  };
  dataCaja: {label: string, values: 
    { Q1: number, Q2: number, Q3: number, whisker_low: number, whisker_high: number, outliers: number[] }}[] = [];

  constructor() {}

  ngOnInit(): void {}

  changeTab(tab: string) {
    if (tab === 'freq') {
      this.isFrequencyTable = true;
      this.isIntervalsTable = false;
      this.isDotPlot = false;
      this.isBoxPlot = false;
    }
    if (tab === 'interv') {
      this.isFrequencyTable = false;
      this.isIntervalsTable = true;
      this.isDotPlot = false;
      this.isBoxPlot = false;
    }
    if (tab === 'dot') {
      this.isFrequencyTable = false;
      this.isIntervalsTable = false;
      this.isDotPlot = true;
      this.isBoxPlot = false;
    }
    if (tab === 'box') {
      this.isFrequencyTable = false;
      this.isIntervalsTable = false;
      this.isDotPlot = false;
      this.isBoxPlot = true;
    }
  }

  insertValue() {
    this.values.push({ value: this.value });
    this.graphicValues.push(this.value);
  }

  handleFrequencies() {
    let totalValues = 0;
    this.values.forEach((data) => {
      if (
        this.tableValues.find((tableData) => tableData.value === data.value)
      ) {
        const tableValue = this.tableValues.find(
          (tableData) => tableData.value === data.value
        ).f;
        this.tableValues.find((tableData) => tableData.value === data.value).f =
          tableValue + 1;
      } else {
        const frequencyRow: Frequency = {
          value: data.value,
          f: 1,
        };
        this.tableValues.push(frequencyRow);
      }
    });
    this.tableValues.forEach((val) => (totalValues += val.f));
    this.tableValues.forEach((data, index) => {
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
    this.media = this.calculateMedia(this.graphicValues);
    this.calcularModa(this.graphicValues);
    this.data = this.generateData(1);
    this.showDotPlot = true;
    this.handleIntervals();
  }

  handleIntervals() {
    let total = 0;
    let min = 0;
    let max = 0;
    this.tableValues.forEach(tabValue => {
      total += tabValue.f;
      min = Math.min(...this.graphicValues);
      max = Math.max(...this.graphicValues);
    });
    let intervalsTotal = (1 + 3.3 * (Math.log10(total)));

    const toEvaluateInterval = intervalsTotal.toFixed(1);
    if (+toEvaluateInterval.split('.')[1] >= 5) {
      intervalsTotal = Math.ceil(intervalsTotal);
    } else if (+toEvaluateInterval.split('.')[1] < 5) {
      intervalsTotal = Math.floor(intervalsTotal);
    }
    const maxMinusMin = max - min;
    const amplitud = maxMinusMin / intervalsTotal;
    this.createIntervalsTable(amplitud, intervalsTotal);
    this.tableIntervalValues.forEach((data, index) => {
      data.fr = data.f / total;
      data.fPercent = data.fr * 100;
      if (index === 0) {
        data.fa = data.fPercent;
      } else {
        data.fa = data.fPercent + this.tableIntervalValues[index - 1].fa;
      }
    });
  }

  createIntervalsTable(amplitud, intervalsTotal) {
    let actualMaxVal = 0;
    let actualMinVal = 0;
    for (let index = 0; index < (this.graphicValues.length); index++) {
      const element = this.graphicValues[index];
      if (index === 0) {
        actualMinVal = element;
        actualMaxVal = element + amplitud;
        this.tableIntervalValues.push({valueIntervalMin: actualMinVal, valueIntervalMax: actualMaxVal, f: 0});
      }
      if (index !== 0 && element >= actualMaxVal) {
        actualMinVal += amplitud;
        actualMaxVal += amplitud;
        this.tableIntervalValues.push({valueIntervalMin: actualMinVal, valueIntervalMax: actualMaxVal, f: 0});
      }

      if (element >= actualMinVal && element <= actualMaxVal) {
        const actIndex = this.tableIntervalValues.findIndex(interValue =>
          interValue.valueIntervalMin <= element && interValue.valueIntervalMax >= element);
        this.tableIntervalValues[actIndex].f += 1;
        console.log('frecuencia ' + this.tableIntervalValues[actIndex].f + ' valor' + element);
      }
    }
    this.tableIntervalValues.pop();

    const valoresParaCaja = arraystat(this.graphicValues);
    this.optionsCaja.chart.yDomain = [valoresParaCaja.min - 10, valoresParaCaja.max + 10];
    this.dataCaja.push({label: 'Datos', values: {
      Q1: valoresParaCaja.q1,
      Q2: valoresParaCaja.median,
      Q3: valoresParaCaja.q3,
      whisker_high: valoresParaCaja.max,
      whisker_low: valoresParaCaja.min,
      outliers: []
    }});
    console.log(this.tableIntervalValues);
  }

  handleXAndYValues() {
    let maxValue = 0;
    this.tableValues.forEach((value) => {
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

  calculateMedian(values: number[]) {
    if (values.length === 0) {
      return 0;
    }

    values.sort((a, b) => {
      return a - b;
    });

    const half = Math.floor(values.length / 2);

    if (values.length % 2) {
      return values[half];
    }

    return (values[half - 1] + values[half]) / 2.0;
  }

  calculateMedia(numeros: number[]) {
    let total = 0;
    let i;
    for (i = 0; i < numeros.length; i += 1) {
        total += numeros[i];
    }
    return total / numeros.length;
  }

  generateData(groups) {
    const data = [];
    const shapes = [
      'circle',
      'cross',
      'triangle-up',
      'triangle-down',
      'diamond',
      'square',
    ];

    for (let i = 0; i < groups; i++) {
      data.push({
        key: 'Grupo ' + i,
        values: [],
      });

      for (let j = 0; j < this.tableValues.length; j++) {
        data[i].values.push({
          x: this.tableValues[j].value,
          y: this.tableValues[j].f,
          size: Math.floor(Math.random() * (30 - 20 + 1) + 20),
          shape: shapes[j % 6],
        });
      }
    }
    return data;
  }

  calcularModa(numeros: number[]) {
    const modes = [];
    const count = [];
    let i: any;
    let numero: number;
    let maxIndex = 0;

    for (i = 0; i < numeros.length; i += 1) {
        numero = numeros[i];
        count[numero] = (count[numero] || 0) + 1;
        if (count[numero] > maxIndex) {
            maxIndex = count[numero];
        }
    }

    for (i in count) {
        if (count.hasOwnProperty(i)) {
            if (count[i] === maxIndex) {
                modes.push(Number(i));
            }
        }
    }
    this.moda = modes[modes.length - 1];
  }
}
