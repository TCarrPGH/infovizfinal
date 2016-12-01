//Assiciated with the DOM
//needs to be loaded before the javascript, so it's wrapped in jquery
var hitslineChart  = dc.lineChart("#chart-line-hitsperday"); 
var data = [
    {"status":"http_302","hits":0,"date":"01/03/2013"},
    {"status":"http_200","hits":90,"date":"01/03/2013"},
    {"status":"http_200","hits":200,"date":"01/07/2013"},
    {"status":"http_302","hits":1,"date":"01/06/2013"},
    {"status":"http_200","hits":200,"date":"01/06/2013"},
    {"status":"http_404","hits":2,"date":"01/06/2013"},
    {"status":"http_302","hits":0,"date":"01/05/2013"},
    {"status":"http_200","hits":90,"date":"01/05/2013"},
    {"status":"http_404","hits":2,"date":"01/05/2013"},
    {"status":"http_302","hits":0,"date":"01/04/2013"},
    {"status":"http_200","hits":90,"date":"01/04/2013"},
    {"status":"http_404","hits":2,"date":"01/04/2013"},
    {"status":"http_302","hits":100,"date":"01/07/2013"},
    {"status":"http_404","hits":1,"date":"01/07/2013"},
    {"status":"http_404","hits":2,"date":"01/03/2013"},
    {"status":"http_302","hits":1,"date":"01/02/2013"},
    {"status":"http_200","hits":10,"date":"01/02/2013"},
    {"status":"http_404","hits":1,"date":"01/02/2013"},
    {"status":"http_302","hits":0,"date":"01/01/2013"},
    {"status":"http_200","hits":90,"date":"01/01/2013"},
    {"status":"http_404","hits":2,"date":"01/01/2013"},
    {"status":"http_302","hits":0,"date":"12/31/2012"},
    {"status":"http_200","hits":90,"date":"12/31/2012"},
    {"status":"http_302","hits":100,"date":"12/27/2012"},
    {"status":"http_404","hits":2,"date":"12/27/2012"},
    {"status":"http_200","hits":90,"date":"12/30/2012"},
    {"status":"http_404","hits":2,"date":"12/30/2012"},
    {"status":"http_302","hits":200,"date":"12/29/2012"},
    {"status":"http_200","hits":300,"date":"12/29/2012"},
    {"status":"http_404","hits":1,"date":"12/29/2012"},
    {"status":"http_302","hits":100,"date":"12/28/2012"},
    {"status":"http_200","hits":10,"date":"12/28/2012"},
    {"status":"http_404","hits":2,"date":"12/28/2012"},
    {"status":"http_200","hits":190,"date":"12/27/2012"},
    {"status":"http_404","hits":2,"date":"12/31/2012"},
    {"status":"http_302","hits":0,"date":"12/30/2012"}
];
var ndx = crossfilter(data); 
//--------------------Column Generation-------------------//
var parseDate = d3.time.format("%m/%d/%Y").parse;
data.forEach(function(d) {
	d.date = parseDate(d.date); //Line Chart?>x-axis: Date
	//d.total= d.http_404+d.http_200+d.http_302; //Line Chart?>y-axis: Hits 
	d.Year=d.date.getFullYear(); //Pie Chart?> Year
});
//------------------Dimensions -----------------------//

//pie chart dimension 
//sum of the yearly totals
var dateDim = ndx.dimension(function(d) {return d.date;});
var hits = dateDim.group().reduceSum(function(d) {return d.total;}); 

//gets the min and max data for the x and y axis
var minDate = dateDim.bottom(1)[0].date;
var maxDate = dateDim.top(1)[0].date;
print_filter("data"); //shows array structure

//gets the min and max data for the x and y axis
var status_200=dateDim.group().reduceSum(function(d) 
   {if (d.status==='http_200') {return d.hits;}else{return 0;}});
var status_302=dateDim.group().reduceSum(function(d) 
   {if (d.status==='http_302') {return d.hits;}else{return 0;}});
var status_404=dateDim.group().reduceSum(function(d) 
   {if (d.status==='http_404') {return d.hits;}else{return 0;}}); 

//sets chart dimension (x-axis) and group (y axis) and range
//brush and lables are added here
hitslineChart
   .width(500).height(200)
   .dimension(dateDim)
   .group(status_200,"200")
   .stack(status_302,"302")
   .stack(status_404,"404")   
   .renderArea(true)
   .x(d3.time.scale().domain([minDate,maxDate]))
   .brushOn(false)
   .margins({ top: 10, left: 50, right: 10, bottom: 50 })    
	.legend(dc.legend().x(70).y(10).itemHeight(13).gap(5))//legend location
	.renderlet(function (chart) {chart.selectAll("g.x text").attr('dx', '-30').attr(
		'dy', '-7').attr('transform', "rotate(-90)");}) 
   .yAxisLabel("Hits per day")
   .elasticX(true); //prevents datapoints from setting to 0
   
//--------------------Line Chart creation-----------------//
var yearRingChart = dc.pieChart("#chart-ring-year");
//date Dimension line chart
var yearDim  = ndx.dimension(function(d) {return +d.Year;});
var year_total = yearDim.group().reduceSum(function(d) {return d.hits;}); 

/************************************************
JQuery listens for clicks on the chart
*************************************************/
$('#chart-ring-year').on('click', function(){
    var minDate2 = dateDim.bottom(1)[0].date;
    var maxDate2 = dateDim.top(1)[0].date;
    hitslineChart.x(d3.time.scale().domain([minDate2,maxDate2]));
    hitslineChart.redraw();
});
//---------------Pie Chart creation:year-----------------//
yearRingChart
    .width(150).height(150)
    .dimension(yearDim)
    .group(year_total)
    .innerRadius(30);
	
//--------------Pie Chart creation:status----------------->
var statusRingChart = dc.pieChart("#chart-ring-status");
var statusDim  = ndx.dimension(function(d) {return d.status;});
var hit_status = statusDim.group().reduceSum(function(d) {return d.hits;});

statusRingChart
    .width(150).height(150)
    .dimension(statusDim)
    .group(hit_status)
    .innerRadius(30);  
//-----------------------datatable------------------------>

var datatable   = dc.dataTable("#dc-data-table");
var tableGroup = dateDim.group().reduce(
  function(p,v) {
    p[v.status] = (p[v.status] || 0) + +v.hits;
    p["Year"]=v.Year;
    return p;
  },
  function(p,v) {
    p[v.status] = (p[v.status] || 0) - +v.hits;
    p["Year"]=v.Year;
    return p;
  },
  function() { return {}; });

datatable
    .dimension(tableGroup)
    .group(function(d) {return d.value.Year;})
    // dynamic columns creation using an array of closures
    .columns([
        function(d) {return d.key.getDate() + "/" + (d.key.getMonth() + 1) + "/" + d.key.getFullYear(); },
        function(d) {return d.value.http_200;},
        function(d) {return d.value.http_302;},
        function(d) {return d.value.http_404;},
        function(d) {return d.value.http_200+d.value.http_302+d.value.http_404;}
    ]);

//draws chart	

dc.renderAll(); 


//-------------Prints command line values-----------------//
function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 
 