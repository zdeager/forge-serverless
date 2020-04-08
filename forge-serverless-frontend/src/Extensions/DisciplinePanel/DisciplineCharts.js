export function CIVizData(CIData) {
  const categories = CIData.map((data, idx) => idx);
  const label_colors = CIData.map((data, idx) => '#fff');
  return {
    series: [{
        name: "CI",
        data: CIData
    }],
    options: {
      chart: {
        id: 'ci',
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Condition Index',
        align: 'left',
        style: {
          color:  '#fff'
        },
      },
      grid: {
        row: {
          colors: ['transparent'], 
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
              colors: '#fff',
          },
        },
        title: {
          text: "Year",
          style: {
            color:  '#fff'
          },
        },
      },
      yaxis: {
        title: {
          text: undefined
        },
        labels: {
          formatter: function (val) {
            return val + "%"
          },
          style: {
              colors: '#fff'
          },
        }
      },
      tooltip: {
        x: {
          formatter: function (val) {
            return "Year " + (val-1)
          }
        }
      },
    },  
  };
}

export function CostVizData(costData) {
  const categories = costData.procurement.map((data, idx) => idx);
  return {
    series: [{
      name: 'Procurement',
      data: costData.procurement
    }, {
      name: 'Maintenance (Labor)',
      data: costData.labor
    }, {
      name: 'Maintenance (Material)',
      data: costData.material
    }, {
      name: 'Depreciation',
      data: costData.depr
    }],
    options: {
      chart: {
        id: 'cost',
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: {
          show: false
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      title: {
        text: 'Costs',
        style: {
          color:  '#fff'
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
              colors: '#fff'
          },
        },
        title: {
          text: 'Year',
          style: {
            color:  '#fff'
          },
        },
      },
      yaxis: {
        title: {
          text: 'Cost (USD)',
          style: {
            color:  '#fff'
          },
        },
        labels: {
          formatter: function (val) {
            return val + "K"
          },
          style: {
              colors: '#fff',
          },
        }
      },
      tooltip: {
        x: {
          formatter: function (val) {
            return "Year " + val
          }
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 0,
        labels: {
            colors: '#fff'
        }
      }
    },
  };
}
