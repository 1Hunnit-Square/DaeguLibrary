import * as am5 from "@amcharts/amcharts5";
import * as am5wc from "@amcharts/amcharts5/wc";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLayoutEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { getWordCloud } from "../../api/bookPythonApi"
import { memberNameSelector } from '../../atoms/loginState';
import { useRecoilValue } from "recoil";
import { getMemberYearBorrowHistory } from "../../api/memberApi";


const initialWordCloud = [
  { "tag": "독서", "weight": 50 },
  { "tag": "책읽기", "weight": 50 },
  { "tag": "읽자", "weight": 50 },
  { "tag": "책보자", "weight": 50 },
  { "tag": "집중", "weight": 50 },
  { "tag": "책속으로", "weight": 50 },
  { "tag": "조용한시간", "weight": 50 },
  { "tag": "책한권", "weight": 50 },
  { "tag": "하루한책", "weight": 50 },
  { "tag": "한줄독서", "weight": 50 },
  { "tag": "페이지넘김", "weight": 50 },
  { "tag": "책의향기", "weight": 50 },
  { "tag": "글자", "weight": 50 },
  { "tag": "활자", "weight": 50 },
  { "tag": "지식흡수", "weight": 50 },
  { "tag": "조용히읽기", "weight": 50 },
  { "tag": "책과함께", "weight": 50 },
  { "tag": "책펼치기", "weight": 50 },
  { "tag": "한페이지", "weight": 50 },
  { "tag": "지혜", "weight": 50 },
  { "tag": "사색", "weight": 50 },
  { "tag": "마음의양식", "weight": 50 },
  { "tag": "문장", "weight": 50 },
  { "tag": "책갈피", "weight": 50 },
  { "tag": "책책책", "weight": 50 },
  { "tag": "글읽기", "weight": 50 },
  { "tag": "생각하기", "weight": 50 },
  { "tag": "집중력", "weight": 50 },
  { "tag": "고요함", "weight": 50 },
  { "tag": "지적시간", "weight": 50 },
  { "tag": "책읽는밤", "weight": 50 },
  { "tag": "읽는즐거움", "weight": 50 },
  { "tag": "정독", "weight": 50 },
  { "tag": "숙독", "weight": 50 },
  { "tag": "책벌레", "weight": 50 },
  { "tag": "활자중독", "weight": 50 },
  { "tag": "필사", "weight": 50 },
  { "tag": "한권읽기", "weight": 50 },
  { "tag": "책읽는습관", "weight": 50 },
  { "tag": "오늘도한페이지", "weight": 50 }
]



const MyReadingComponent = () => {
  const name = useRecoilValue(memberNameSelector);

  const { data: wordCloud = { data: [] }, isLoading: iwWordCloudLoading, isError: isWordCloudError } = useQuery({
    queryKey: ["wordCloud"],
    queryFn: getWordCloud,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const { data: borrowList = {}, isLoading: borrowListLoading, isError: isBorrowListError } = useQuery({
    queryKey: ["borrowList"],
    queryFn: getMemberYearBorrowHistory,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  console.log("borrowList", borrowList);

  useLayoutEffect(() => {
    if (iwWordCloudLoading) return;
    let root = am5.Root.new("chartdiv");
      root.setThemes([
      am5themes_Animated.new(root)
    ]);
    let series = root.container.children.push(am5wc.WordCloud.new(root, {
      categoryField: "tag",
      valueField: "weight",
      maxFontSize: am5.percent(50),
      minFontSize: am5.percent(20),
    }));
    series.labels.template.setAll({
      fontFamily: "Courier New"
    });
    setInterval(function() {
      am5.array.each(series.dataItems, function(dataItem) {
        let value = Math.random() * 65;
        value = value - Math.random() * value;
        dataItem.set("value", value);
        dataItem.set("valueWorking", value);
      })
    }, 5000)

    const displayData = wordCloud?.data?.length > 0 ? wordCloud.data : initialWordCloud;
    series.data.setAll(displayData);
    return () => {
      root.dispose();
    };
  }, [wordCloud, iwWordCloudLoading]);



 useLayoutEffect(() => {
      if (borrowListLoading) return;
      let root = am5.Root.new("racediv");

      root.numberFormatter.setAll({
        numberFormat: "#a",
        bigNumberPrefixes: [
          { number: 1e6, suffix: "M" },
          { number: 1e9, suffix: "B" }
        ],
        smallNumberPrefixes: []
      });

      let stepDuration = 2000;

      root.setThemes([am5themes_Animated.new(root)]);

      let chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0
      }));

      chart.zoomOutButton.set("forceHidden", true);

      let yRenderer = am5xy.AxisRendererY.new(root, {
        minGridDistance: 20,
        inversed: true,
        minorGridEnabled: true
      });

      yRenderer.grid.template.set("visible", false);

      let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "network",
        renderer: yRenderer
      }));

      let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        min: 0,
        strictMinMax: true,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererX.new(root, {})
      }));

      xAxis.set("interpolationDuration", stepDuration / 10);
      xAxis.set("interpolationEasing", am5.ease.linear);

      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "value",
        categoryYField: "network"
      }));

      series.columns.template.setAll({ cornerRadiusBR: 5, cornerRadiusTR: 5 });

      series.columns.template.adapters.add("fill", function (fill, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });

      series.columns.template.adapters.add("stroke", function (stroke, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationX: 1,
          sprite: am5.Label.new(root, {
            text: "{valueXWorking.formatNumber('#. a')}",
            fill: root.interfaceColors.get("alternativeText"),
            centerX: am5.p100,
            centerY: am5.p50,
            populateText: true
          })
        });
      });

      let label = chart.plotContainer.children.push(am5.Label.new(root, {
        text: "1월",
        fontSize: "8em",
        opacity: 0.2,
        x: am5.p100,
        y: am5.p100,
        centerY: am5.p100,
        centerX: am5.p100
      }));

      function getSeriesItem(category) {
        for (var i = 0; i < series.dataItems.length; i++) {
          let dataItem = series.dataItems[i];
          if (dataItem.get("categoryY") == category) {
            return dataItem;
          }
        }
      }

      function sortCategoryAxis() {

        series.dataItems.sort(function (x, y) {
          return y.get("valueX") - x.get("valueX");
        });


        am5.array.each(yAxis.dataItems, function (dataItem) {

          let seriesDataItem = getSeriesItem(dataItem.get("category"));

          if (seriesDataItem) {

            let index = series.dataItems.indexOf(seriesDataItem);

            let deltaPosition = (index - dataItem.get("index", 0)) / series.dataItems.length;

            if (dataItem.get("index") != index) {
              dataItem.set("index", index);

              dataItem.set("deltaPosition", -deltaPosition);

              dataItem.animate({
                key: "deltaPosition",
                to: 0,
                duration: stepDuration / 2,
                easing: am5.ease.out(am5.ease.cubic)
              });
            }
          }
        });


        yAxis.dataItems.sort(function (x, y) {
          return x.get("index") - y.get("index");
        });
      }

      const chartData = borrowList;

      function setInitialData() {
        const months = Object.keys(chartData);
        let d = chartData[months[0]];

        for (var n in d) {
          series.data.push({ network: n, value: 0 });
          yAxis.data.push({ network: n });
        }

        label.set("text", "");
      }


      function updateData(month) {
        let itemsWithNonZero = 0;
        let d = chartData[month];

        if (d) {
          label.set("text", month);

          am5.array.each(series.dataItems, function (dataItem) {
            let category = dataItem.get("categoryY");
            let value = d[category];

            if (value > 0) {
              itemsWithNonZero++;
            }


            dataItem.animate({
              key: "valueX",
              to: value,
              duration: stepDuration,
              easing: am5.ease.linear
            });

            dataItem.animate({
              key: "valueXWorking",
              to: value,
              duration: stepDuration,
              easing: am5.ease.linear
            });
          });


          yAxis.zoom(0, itemsWithNonZero / yAxis.dataItems.length);
        }
      }


      setInitialData();


      let sortInterval = setInterval(function () {
        sortCategoryAxis();
      }, 100);


      let interval;
      let currentIndex = -1
      const months = Object.keys(chartData);


      interval = setInterval(function () {
        currentIndex = currentIndex + 1;


        if (currentIndex >= months.length - 1) {
          clearInterval(interval);
          clearInterval(sortInterval);


          const lastMonth = months[months.length - 1];
          updateData(lastMonth);
          return;
        }

        const nextMonth = months[currentIndex];

        updateData(nextMonth);
      }, stepDuration);


      return () => {
        clearInterval(interval);
        clearInterval(sortInterval);
        root.dispose();
      };
    }, [borrowList, borrowListLoading]);






    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="border border-gray-300 min-h-20 flex items-center justify-center w-full sm:w-full md:max-w-[80%] lg:max-w-[60%] xl:max-w-[50%] mx-auto rounded-lg px-4 py-3 bg-white shadow-sm">
          <p className="text-sm sm:text-base md:text-sm text-center text-gray-700 font-medium">
            <span className="text-[#00893B] font-semibold">{name}</span>님께서 대출하신 도서에 대한 분석 자료입니다.
          </p>
        </div>
  
        <div className="flex flex-col items-center justify-center text-center mt-16 mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">연간 독서량</h2>
          <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[75%] xl:w-[70%]">
            {borrowListLoading ? (
              <div id="loadingracediv" className="h-[400px] mx-auto border border-gray-200 rounded-lg bg-gray-50 flex justify-center items-center shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00893B] mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">독서량 데이터를 분석중입니다...</p>
                </div>
              </div>
            ) : (
              <div id="racediv" className="h-[400px] mx-auto border border-gray-200 rounded-lg bg-white shadow-sm"></div>
            )}
          </div>
        </div>
  
        <div className="flex flex-col items-center justify-center text-center mt-16 mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">관심 도서 장르</h2>
          <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[75%] xl:w-[70%]">
            {iwWordCloudLoading ? (
              <div id="loadingdiv" className="h-[400px] mx-auto border border-gray-200 rounded-lg bg-gray-50 flex justify-center items-center shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00893B] mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">사용자의 대출 정보를 분석중입니다...</p>
                </div>
              </div>
            ) : (
              <div id="chartdiv" className="h-[400px] mx-auto border border-gray-200 rounded-lg bg-white shadow-sm"></div>
            )}
          </div>
        </div>
      </div>
    );
}

export default MyReadingComponent;