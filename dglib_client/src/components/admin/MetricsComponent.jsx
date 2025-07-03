import { getMetricsStats } from "../../api/metricsApi";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../routers/Loading";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import Button from "../common/Button";

const MetricsComponent = () => {
    const [uptimeSec, setUptimeSec] = useState(0);
    const chartRef = useRef(null);
     const { data, isFetching, isError, refetch } = useQuery({
        queryKey: ['metricsStats'],
        queryFn: () => getMetricsStats(),
        refetchOnWindowFocus: false,
    });

useLayoutEffect(() => {
  if (!data) return;

  // root 딱 한 번 생성
  const root = am5.Root.new(chartRef.current);
  root.setThemes([am5themes_Animated.new(root)]);

  const container = root.container.children.push(
  am5.Container.new(root, {
    layout: am5.HorizontalLayout.new(root, {
       justifyContent: "center",
      gap: 20
    }),
    width: am5.percent(100),
    height: am5.percent(100)
  })
);

  // 1. CPU 막대 그래프 그리기
  const drawCpuBarChart = () => {
    const chartData = data.cpuList.map(cpu => ({
      category: "CPU" + cpu.cpuNumber,
      value1: cpu.user,
      value2: cpu.system,
      value3: cpu.idle,
    }));

    const chart = container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
        width: am5.percent(40)
      
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
    xRenderer.labels.template.setAll({
      paddingTop: 15,
      paddingBottom: 15,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
      })
    );
    xAxis.data.setAll(chartData);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const createSeries = (name, field, color) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: field,
          categoryXField: "category",
          stacked: true,
          clustered: false,
          tooltip: am5.Tooltip.new(root, {
            labelText: `[bold]{name}[/]: {valueY}%`,
          }),
        })
      );

      series.columns.template.setAll({
        fill: color,
        stroke: color,
        width: am5.percent(50),
      });

      series.data.setAll(chartData);
      return series;
    };

    createSeries("사용자", "value1", am5.color(0x4f81bd));
    createSeries("시스템", "value2", am5.color(0xc0504d));
    createSeries("유휴", "value3", am5.color(0xc8e6c9));



// legend 생성 및 설정
const legend = am5.Legend.new(root, {
   layout: root.horizontalLayout,
  centerX: am5.percent(50),
  x: am5.percent(55),
  justifyContent: "center",  
});

legend.labels.template.setAll({
  oversizedBehavior: "wrap",
  whiteSpace: "normal",
  textAlign: "center",
});

legend.data.setAll(chart.series.values);

chart.bottomAxesContainer.children.push(legend);

  }

  // 2. 게이지 차트 그리기
  const drawGaugeChart = () => {
    const verticalContainer = container.children.push(
  am5.Container.new(root, {
    layout: root.verticalLayout,
    width: am5.percent(30),
  })
);


const chart = verticalContainer.children.push(
  am5radar.RadarChart.new(root, {
    panX: false,
    panY: false,
    startAngle: 180,
    endAngle: 360,
    width: am5.percent(100),
    height: 300
    
  })
);

const title = verticalContainer.children.push(
  am5.Label.new(root, {
    text: "CPU 온도",
    fontSize: 20,
    fontWeight: 500,
    width: am5.percent(100),
    textAlign: "center",
  }));




    const axisRenderer = am5radar.AxisRendererCircular.new(root, {
      innerRadius: -10,
      strokeOpacity: 1,
      strokeWidth: 15,
      strokeGradient: am5.LinearGradient.new(root, {
        rotation: 0,
        stops: [
        { color: am5.color(0x3a6cff), offset: 0.0 },   // 파랑 - 원래보다 조금 밝고 부드럽게
        { color: am5.color(0x26a65b), offset: 0.4 },  // 초록 - 약간 채도 낮춰 자연스럽게
        { color: am5.color(0xfff176), offset: 0.6 },  // 노랑 - 좀 더 부드럽고 살짝 연하게
        { color: am5.color(0xfb8c00), offset: 0.8 },  // 주황 - 원래보다 약간 톤 다운
        { color: am5.color(0xd32f2f), offset: 0.9 },  // 빨강 - 채도 낮추고 약간 진하게 안정감 있게
      ]}),
    });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: axisRenderer,
      })
    );

    const axisDataItem = xAxis.makeDataItem({});
    axisDataItem.set("value", 0);

    const bullet = axisDataItem.set(
      "bullet",
      am5xy.AxisBullet.new(root, {
        sprite: am5radar.ClockHand.new(root, {
          radius: am5.percent(99),
        }),
      })
    );

    xAxis.createAxisRange(axisDataItem);
    axisDataItem.get("grid").set("visible", false);

    // Animate pointer to current sensor value (예: data.sensors)
    const sensorValue = data.sensors ?? 0;
    axisDataItem.animate({
      key: "value",
      to: sensorValue,
      duration: 800,
      easing: am5.ease.out(am5.ease.cubic),
    });

    chart.appear(1000, 100);
  };

  drawGaugeChart();
  drawCpuBarChart();
  
  return () => {
    root.dispose();
  };
}, [data]);
console.log(data);


 useEffect(() => {
    if (!data?.bootTime) return;

    // 부팅시간 문자열 → Date 객체 변환
    const bootTime = new Date(data.bootTime);

    // 1초마다 현재시간 - 부팅시간 계산
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - bootTime) / 1000);
      setUptimeSec(diff >= 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const durationTime = (seconds) => {
    if(!seconds){
      return "계산 중...";
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}시간 ${m}분 ${s}초`;
    }

     return (
  <div className="w-[85%] mx-auto my-10 p-10 border border-gray-200 text-gray-900 rounded-2xl shadow-lg space-y-8">
  <h2 className="text-3xl font-extrabold border-b border-gray-300 pb-4 mb-8"> 시스템 통계 </h2>
  {isFetching && <Loading text="정보를 가져오는 중..." />}
  {data && (
    <>
      <section className="bg-white rounded-lg p-6 border border-gray-300 mb-8">
  <h3 className="text-xl font-bold mb-6 border-b border-gray-300 pb-2">시스템 정보</h3>

  <div className="flex flex-col md:flex-row md:space-x-12 space-y-6 md:space-y-0">

    {/* 가동 시간 */}
    <div className="flex-shrink-0 min-w-[160px]">
      <p className="text-gray-700 mb-2 font-semibold">가동 시간</p>
      <p className="text-lg font-semibold text-green-700">{durationTime(uptimeSec)}</p>
      <Button className ="text-sm mt-4" onClick={()=> refetch()}>새로고침</Button>
    </div>

    {/* 메모리 */}
    <div className="flex-1">
      <h4 className="font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-1">메모리</h4>
      <ul className="text-sm space-y-1">
        <li>총 메모리: <span className="text-green-700 ml-1">{(data.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB</span></li>
        <li>사용 중: <span className="text-green-700 ml-1">{(data.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB</span></li>
        <li>사용률: <span className={`font-bold ml-1 ${
          data.memory.percent > 80
            ? "text-red-600"
            : data.memory.percent > 50
            ? "text-yellow-600"
            : "text-green-600"
        }`}>{data.memory.percent}%</span></li>
      </ul>
    </div>

    {/* 연결 상태 */}
    <div className="flex-1">
      <h4 className="font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-1">접속 상태</h4>
      <ul className="space-y-1 text-sm">
        <li>활성화 된 연결: <span className="text-blue-600 font-semibold ml-1">{data.connection.active}</span></li>
        <li>수신 상태: <span className="text-gray-600 ml-1">{data.connection.reading}</span></li>
        <li>응답 상태: <span className="text-gray-600 ml-1">{data.connection.writing}</span></li>
        <li>대기 상태: <span className="text-gray-600 ml-1">{data.connection.waiting}</span></li>
      </ul>
    </div>

    {/* 네트워크 트래픽 */}
    <div className="flex-1">
      <h4 className="font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-1">네트워크 트래픽</h4>
      <ul className="space-y-1 text-sm">
        <li>총 전송량: <span className="text-green-700 ml-1">{(data.network.bytesSentGauge / 1024 ** 3).toFixed(2)} GB</span></li>
        <li>총 수신량: <span className="text-green-700 ml-1">{(data.network.bytesRecvGauge / 1024 ** 3).toFixed(2)} GB</span></li>
        <li>전송 속도: <span className="text-green-700 ml-1">{((data.network.bytesSentRatePerSec * 8) / (1024 * 1024)).toFixed(2)} Mbps</span></li>
        <li>수신 속도: <span className="text-green-700 ml-1">{((data.network.bytesSentRatePerSec * 8) / (1024 * 1024)).toFixed(2)} Mbps</span></li>
      </ul>
    </div>
  </div>
</section>

      {/* CPU 사용률*/}
      <section className="bg-white rounded-lg p-6 border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">CPU 사용률 (코어별)</h3>
          <span className="text-sm text-orange-500 pr-1">CPU 온도 : <span>{data.sensors}°C</span></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse border border-gray-300">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-sm">
              <tr>
                <th className="border border-gray-200 px-4 py-2">CPU</th>
                <th className="border border-gray-200 px-4 py-2">사용자 (%)</th>
                <th className="border border-gray-200 px-4 py-2">시스템 (%)</th>
                <th className="border border-gray-200 px-4 py-2">총 사용률 (%)</th>
                <th className="border border-gray-200 px-4 py-2">유휴 (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.cpuList.map((cpu, idx) => (
                <tr key={cpu.cpuNumber} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border border-gray-200 px-4 py-3 font-semibold text-green-700">CPU{cpu.cpuNumber}</td>
                  <td className="border border-gray-200 px-4 py-3 text-green-600">{cpu.user}%</td>
                  <td className="border border-gray-200 px-4 py-3 text-yellow-600">{cpu.system}%</td>
                  <td className="border border-gray-200 px-4 py-3 font-bold text-blue-600">{cpu.total}%</td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-500">{cpu.idle}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    <div ref={chartRef} style={{ width: "100%", height: "400px", margin: "0 auto" }} />
    

 
    </>
  )}
</div>


  );

}

export default MetricsComponent;