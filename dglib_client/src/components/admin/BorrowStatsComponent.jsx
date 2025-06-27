import { useMemo, useLayoutEffect } from 'react';
import { useDateRangeHandler } from "../../hooks/useDateRangeHandler";
import { useQuery } from "@tanstack/react-query";
import { getTop10Books } from "../../api/adminApi";
import { useSearchParams } from "react-router-dom";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const BorrowStatsComponent = () => {
    const [searchURLParams, setSearchURLParams] = useSearchParams();
    const { dateRange, handleDateChange } = useDateRangeHandler();
    const { data: top10Books = [], isLoading, isError } = useQuery({
        queryKey: ['top10Books', dateRange],
        queryFn: () => {
            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            }
            return getTop10Books(params);
        }
    });
    const books = useMemo(() => top10Books, [top10Books]);
    console.log("대출 베스트 도서 데이터:", books);
    

    const getRankBadge = (rank) => {
        if (rank <= 3) {
            const colors = {
                1: 'bg-yellow-600 text-white',
                2: 'bg-gray-500 text-white',
                3: 'bg-amber-800 text-white'
            };
            return colors[rank];
        }
        return 'bg-gray-200 text-gray-700';
    };

    useLayoutEffect(() => {

        if (!books || books.length === 0) {
            return;
        }
        let root = am5.Root.new("chartdiv");

        root.setThemes([
            am5themes_Animated.new(root)
        ]);
          let chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: true,
            panY: true,
            paddingLeft:0,
            paddingRight:1
        }));
        let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
        cursor.lineY.set("visible", false);
        let xRenderer = am5xy.AxisRendererX.new(root, { 
            minGridDistance: 30, 
            minorGridEnabled: true
        });
        xRenderer.labels.template.setAll({
            rotation: 0,
            centerY: am5.p50,
            centerX: am5.p50,
            maxWidth: 80,
            paddingLeft: 15,
            oversizedBehavior: "truncate",
            ellipsis: "...",
        });
        xRenderer.grid.template.setAll({
            location: 1
        })
        let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0.3,
            categoryField: "country",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(root, {
                labelText: "{fullTitle}"
            })
        }));
        let yRenderer = am5xy.AxisRendererY.new(root, {
            strokeOpacity: 0.1
        })
        let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0.3,
            renderer: yRenderer,
            numberFormat: "#",
            maxPrecision: 0        
        }));
        xAxis.get("renderer").setAll({
        cellStartLocation: 0.2,
        cellEndLocation: 0.8
        });
            
       


        let series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: "Series 1",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "value",
            sequencedInterpolation: true,
            categoryXField: "country",
            tooltip: am5.Tooltip.new(root, {
              labelText: "{valueY}회"
              
            })
        }));
        series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
            series.columns.template.adapters.add("fill", function (fill, target) {
            return chart.get("colors").getIndex(series.columns.indexOf(target));
        });

        series.columns.template.adapters.add("stroke", function (stroke, target) {
            return chart.get("colors").getIndex(series.columns.indexOf(target));
        });

        const truncateTitle = (title, maxLength = 15) => {
            return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
        };
        let data = books.length > 0 ? books.map(book => ({
            country: truncateTitle(book.bookTitle), 
            fullTitle: book.bookTitle, 
            value: Number(book.borrowCount)
        })) : [{
            country: "데이터 없음",
            value: 0
        }];
      
       
          
        xAxis.data.setAll(data);
        series.data.setAll(data);
        series.appear(1000);
        chart.appear(1000, 100);

        return () => {
            root.dispose();
        };

    }, [books]);
        


    return (
        <>
        <div className="bg-white rounded-lg shadow-lg p-15 w-[85%] border border-gray-200 mx-auto mt-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    대출 베스트 도서 TOP 10
                </h2>
                <div className="flex items-center">
                    <span className="mr-5">대출일</span>
                    <input type="date" value={dateRange.startDate} onChange={handleDateChange} name="startDate" className="w-40 border bg-white rounded-md p-2" />
                    <span className="mx-4">-</span>
                    <input type="date" value={dateRange.endDate} onChange={handleDateChange} name="endDate" className="w-40 border bg-white rounded-md p-2" />
                </div>
                
            </div>

            <div className="w-full">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="bg-green-700">
                            <th className="px-3 text-center text-sm font-semibold text-white w-11 rounded-tl-lg">순위</th>
                            <th className="px-3 py-3 text-center text-sm font-semibold text-white w-1/4">도서명</th>
                            <th className="px-3 py-3 text-center text-sm font-semibold text-white w-20">저자</th>
                            <th className="px-3 py-3 text-center text-sm font-semibold text-white w-20">출판사</th>
                            <th className="px-3 py-3 text-center text-sm font-semibold text-white w-24">ISBN</th>
                            <th className="px-3 py-3 text-center text-sm font-semibold text-white w-20">출판일</th>
                            <th className="px-3 py-3 text-center text-sm font-semibold text-white w-16">보유</th>
                            <th className="px-3 py-3 text-center text-sm font-semibold text-white w-20 rounded-tr-lg">대출횟수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book, index) => (
                            <tr 
                                key={index} 
                                className={`
                                    border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200
                                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                                `}
                            >
                                <td className="px-3 py-4 text-center">
                                    <div className={`
                                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                                        ${getRankBadge(index + 1)}
                                    `}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="font-medium text-gray-900 transition-colors truncate" title={book.bookTitle}>
                                        {book.bookTitle}
                                    </div>
                                </td>
                                <td className="px-3 py-4 text-gray-600 text-sm text-center truncate" title={book.author}>
                                    {book.author}
                                </td>
                                <td className="px-3 py-4 text-gray-600 text-sm  text-center truncate" title={book.publisher}>
                                    {book.publisher}
                                </td>
                                <td className="px-3 py-4 text-gray-600 text-xs  text-center font-mono truncate" title={book.isbn}>
                                    {book.isbn}
                                </td>
                                <td className="px-3 py-4 text-gray-600 text-sm  text-center truncate">
                                    {book.pubDate}
                                </td>
                                <td className="px-3 py-4 text-center">
                                    <span className="font-medium text-green-600">
                                        {book.bookCount}권
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center space-x-1">
                                            <span className="font-semibold text-indigo-600">
                                                {book.borrowCount}
                                            </span>
                                            <span className="text-xs text-gray-500">회</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

           
            
        </div>
        <div className="mt-8">
                <div id="chartdiv" style={{ width: "85%", height: "500px", margin: "0 auto", marginBottom : "50px"}}></div>
            </div>

        </>
    );
};

export default BorrowStatsComponent;