import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }
  ngOnInit(): void { }

  // ========== 1. USER OVERVIEW CHART ==========
  userChart = {
    series: [{
      name: 'Users',
      data: [120, 200, 150, 300, 250, 400, 350]
    }],
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    colors: ['#5b69bc'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#6c757d', fontSize: '12px' } }
    },
    yaxis: {
      min: 100,
      max: 400,
      tickAmount: 3,
      labels: { style: { colors: '#6c757d', fontSize: '12px' } }
    },
    grid: {
      borderColor: '#f0f0f0',
      strokeDashArray: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (value: number) => value.toString() }
    },
    dataLabels: { enabled: false }
  };

  // ========== 2. WORKER OVERVIEW CHART ==========
  workerChart = {
    series: [{
      name: 'Workers',
      data: [80, 150, 120, 200, 180, 250, 220]
    }],
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    colors: ['#10c888'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#6c757d', fontSize: '12px' } }
    },
    yaxis: {
      min: 50,
      max: 250,
      tickAmount: 4,
      labels: { style: { colors: '#6c757d', fontSize: '12px' } }
    },
    grid: {
      borderColor: '#f0f0f0',
      strokeDashArray: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (value: number) => value.toString() }
    },
    dataLabels: { enabled: false }
  };

  // ========== 3. BAR CHART (Figure 1) ==========
  barChart = {
    series: [{
      name: 'Revenue',
      data: [4500, 5500, 5500, 9800, 16000, 7878, 6500, 4200, 7800, 7200, 2800]
    }],
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    plotOptions: {
      bar: {
        borderRadius: 20,
        borderRadiusApplication: 'end' as const,
        columnWidth: '45%',
        distributed: true
      }
    },
    colors: [
      '#adb5bd', '#adb5bd', '#adb5bd',
      '#007bff', '#007bff',
      '#007bff', '#adb5bd',
      '#007bff', '#007bff',
      '#adb5bd'
    ],
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ['21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#6c757d', fontSize: '12px' } }
    },
    yaxis: {
      min: 0,
      max: 15000,
      tickAmount: 3,
      labels: {
        formatter: (value: number) => value >= 1000 ? (value / 1000) + 'k' : value.toString(),
        style: { colors: '#6c757d', fontSize: '12px' }
      }
    },
    grid: {
      borderColor: '#f0f0f0',
      strokeDashArray: 0,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }
    },
    tooltip: {
      custom: (opts: any) => {
        const value = opts.series[opts.seriesIndex][opts.dataPointIndex];
        return `<div style="background:#007bff;color:#fff;padding:8px 14px;border-radius:4px;font-weight:600;font-size:13px;box-shadow:0 2px 8px rgba(0,123,255,0.3);">${value.toLocaleString()}</div>`;
      }
    }
  };

}

export class DashbordComponent {
}
