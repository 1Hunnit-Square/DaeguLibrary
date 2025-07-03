import React, { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5xy from "@amcharts/amcharts5/xy"; // XY 차트용 임포트
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { getMemberStats } from "../../api/memberApi";
import { useQuery } from "@tanstack/react-query";

const MemberStatsComponent = () => {


     const { data, isLoading, isError } = useQuery({
        queryKey: ['memberStats'],
        queryFn: () => getMemberStats()
    });


  useLayoutEffect(() => {
    if(!data){
        return;
    }
     const pieRoot = am5.Root.new("piechartscontainer");
  pieRoot.setThemes([am5themes_Animated.new(pieRoot)]);

  const pieContainer = pieRoot.container.children.push(
    am5.Container.new(pieRoot, {
      layout: pieRoot.horizontalLayout,
      width: am5.percent(100),
      height: am5.percent(100),
      gap: 20,
    })
  );

  // 첫 번째 파이 차트
  const chart1 = pieContainer.children.push(
    am5percent.PieChart.new(pieRoot, {
      layout: pieRoot.verticalLayout,
      width: am5.percent(50),
      height: am5.percent(100),
    })
  );
  const series1 = chart1.series.push(
    am5percent.PieSeries.new(pieRoot, {
      valueField: "value",
      categoryField: "category",
    })
  );
  const pieColors1 = [am5.color(0x64b5f6), am5.color(0xf48fb1)];
  series1.slices.template.adapters.add("fill", (fill, target) => {
    const index = series1.slices.indexOf(target);
    return pieColors1[index % pieColors1.length];
  });
  series1.slices.template.setAll({
    stroke: am5.color(0xffffff),
    strokeWidth: 1,
    tooltipText: "{category}: {value}명"
  });
  series1.setAll({
    alignLabels: true,
    innerRadius: am5.percent(50),
  });
  series1.ticks.template.set("visible", false);
  series1.labels.template.setAll({
    textType: "adjusted",
    inside: true,
    radius: 40,
    maxWidth: 60,
    fill: am5.color(0x000000),
  });
  series1.data.setAll(
    data.genderCount.map((v) => ({ value: v.count, category: v.gender }))
  );
  series1.set("alignLabels", false);
  series1.appear(1000, 100);

  // 두 번째 파이 차트
  const chart2 = pieContainer.children.push(
    am5percent.PieChart.new(pieRoot, {
      layout: pieRoot.verticalLayout,
      width: am5.percent(50),
      height: am5.percent(100),
    })
  );
  const series2 = chart2.series.push(
    am5percent.PieSeries.new(pieRoot, {
      valueField: "value",
      categoryField: "category"
    })
  );
  const pieColors2 = [
    am5.color(0xffb74d),
    am5.color(0xaed581),
    am5.color(0x4db6ac),
    am5.color(0xba68c8),
    am5.color(0xfff176),
    am5.color(0x81d4fa),
  ];
  series2.slices.template.adapters.add("fill", (fill, target) => {
    const index = series2.slices.indexOf(target);
    return pieColors2[index % pieColors2.length];
  });
  series2.setAll({
    alignLabels: true,
    innerRadius: am5.percent(50),
  });
  series2.slices.template.setAll({
    stroke: am5.color(0xffffff),
    strokeWidth: 1,
    tooltipText: "{category}: {value}명"
  });
  series2.labels.template.setAll({
    textType: "adjusted",
    inside: true,
    radius: 40,
    maxWidth: 60,
    fill: am5.color(0x000000),
  });
  series2.ticks.template.set("visible", false);
  series2.data.setAll(
    data.ageCount.map((v) => ({ value: v.count, category: v.age }))
  );
  series2.set("alignLabels", false);
  series2.appear(1000, 100);

    // 3. 가로 막대그래프 (XYChart)
    let barChartRoot = am5.Root.new("barchartdiv");
    barChartRoot.setThemes([am5themes_Animated.new(barChartRoot)]);

    let barChart = barChartRoot.container.children.push(
      am5xy.XYChart.new(barChartRoot, {
        layout: barChartRoot.verticalLayout,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 20,
        paddingBottom: 20,
      })
    );

    // 세로축(categoryAxis) - 연령대 또는 카테고리명
    let categoryAxis = barChart.yAxes.push(
      am5xy.CategoryAxis.new(barChartRoot, {
        categoryField: "category",
        renderer: am5xy.AxisRendererY.new(barChartRoot, {
          inversed: true,
          minGridDistance: 30,
        }),
      })
    );

    categoryAxis.get("renderer").labels.template.setAll({
  paddingRight: 15,
});

    // 가로축(valueAxis)
    let valueAxis = barChart.xAxes.push(
      am5xy.ValueAxis.new(barChartRoot, {
        min: 0,
        renderer: am5xy.AxisRendererX.new(barChartRoot, {}),
      })
    );

    // 막대 시리즈 생성
    let barSeries = barChart.series.push(
      am5xy.ColumnSeries.new(barChartRoot, {
        name: "Members",
        xAxis: valueAxis,
        yAxis: categoryAxis,
        valueXField: "value",
        categoryYField: "category",
        sequencedInterpolation: true,
      })
    );

    // 막대 색상 지정 (기존 pieColors2와 동일하게)
    barSeries.columns.template.adapters.add("fill", (fill, target) => {
      const index = barSeries.columns.indexOf(target);
      return pieColors2[index % pieColors2.length];
    });
    barSeries.columns.template.adapters.add("stroke", (stroke, target) => {
      const index = barSeries.columns.indexOf(target);
      return am5.color(0xffffff);
    });

    barSeries.columns.template.setAll({
    height: 30,
    tooltipText: "{category}: {value}명",
    });


    barSeries.data.setAll(
  data.regionCount.map(v => ({ "value" : v.count, "category": v.region}))

    );

    categoryAxis.data.setAll(barSeries.dataItems.map((di) => di.dataContext));

    barSeries.appear(1000);

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      pieRoot.dispose();
      barChartRoot.dispose();
    };
  }, [data]);


  return (
    <div
      className="mx-auto w-[80%] h-[1300px]"
      style={{ display: "flex", flexDirection: "column", gap: "50px" }}
    >
                <div className="border border-gray-300 min-h-20 flex items-center justify-center w-full sm:w-full md:max-w-[75%] lg:max-w-[85%] xl:max-w-[75%] mx-auto rounded-lg px-4 py-3 bg-white shadow-sm mt-10">
                <p className="text-center text-emerald-700 font-medium">
                    도서관 내 성별 및 연령별 회원 통계입니다.
                </p>
            </div>
        <div id="piechartscontainer" style={{ width: "100%", height: "400px" }}></div>
      <div className="border border-gray-300 min-h-20 flex items-center justify-center w-full sm:w-full md:max-w-[75%] lg:max-w-[85%] xl:max-w-[75%] mx-auto rounded-lg px-4 py-3 bg-white shadow-sm mt-10">
                <p className="text-center text-emerald-700 font-medium">
                    도서관 내 지역별 회원 통계입니다.
                </p>
        </div>
      <div id="barchartdiv" style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
};

export default MemberStatsComponent;
