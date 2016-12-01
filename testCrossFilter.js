

//formats the json file into a readable format
d3.json('infections.json', function(data) {
	var flattenedData = [];
	var parseYear = d3.time.format("%Y").parse;
	for(var state of data.states){
		for(var stateData of state.stateData){ //
			flattenedData.push({
				"stateName": state.name ,
				"stateAbr": state.abbreviation  ,
				"date": parseYear(stateData.year),
				"infection": stateData.infection ,
			});
			
		}
	}
	//------------Dimensions---------------//
	var ndx = crossfilter(flattenedData);	
	var numberFormat = d3.format(",d");
	
	var dateDim = ndx.dimension(function(d) {return d.date;});
	var stateDim = ndx.dimension(function(d) {return d.stateName;});
	var stateAbrDim = ndx.dimension(function(d) {return d.stateAbr;});
	
    
    stateDim.filterAll();
	//filter by state
	var stateInfectionDimGroup = stateDim.group().reduceSum(function(d) {return d.infection;});
	 
	
	var infectionDim = ndx.dimension(function(d) {return d.infection;});
	
	
	var infectionDimGroup = dateDim.group().reduceSum(function(d) {	return d.infection;});
	
    
	var stateRaisedSum = stateAbrDim.group().reduceSum(function (d) {return d.infection});
	var minDate = dateDim.bottom(1)[0].date;
	var maxDate = dateDim.top(1)[0].date;
	
	var hitslineChart  = dc.lineChart("#chart-line-hitsperday");	
	var usChart = dc.geoChoroplethChart("#us-chart");
	 var chart = dc.barChart('#chart');
	//## change slider score value to re-assign the data in pie chart
  
	//filter domain to infection rate
	var topInfectionValue = stateRaisedSum.top(Infinity);
	var minInfection = topInfectionValue[0].value;
	var maxInfection = topInfectionValue[49].value;
	

	usChartColorScale = d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]).domain([minInfection, maxInfection]);
	d3.json("geo/us-states.json", function (statesJson) {
		usChart
			.width(960)
			.height(500)
		  
		  .dimension(stateAbrDim)
		  .group( stateRaisedSum)
		  .colors(usChartColorScale)
		  .colorCalculator(function (d) { return d ? usChart.colors()(d) : '#ccc'; })
		  .overlayGeoJson(statesJson.features, "state", function (d) {
			return d.properties.name;
		  })
		  .title(function (d) {
			return "state: " + d.key + "\nInfections: " + numberFormat(d.value ? d.value : 0);
		  });

		//create line Chart---------------------------------------------------------->	
		hitslineChart
			.width(400).height(200)
			.dimension(dateDim)  
			.group(infectionDimGroup)
			
			.x(d3.time.scale().domain([minDate,maxDate]))
			.renderArea(true)
			.brushOn(false)
			.legend(dc.legend().x(420).y(10).itemHeight(13).gap(5))
			.yAxisLabel("Infection Rate")
			  .select("g.axis.y")
				.attr("transform", "translate(71, 0)");

			//barchart---
		chart
          .width(920)
          .height(175)
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          .brushOn(false)
          .xAxisLabel('Fruit')
		  .y(d3.scale.linear().domain([0, 22000]))
          .yAxisLabel('Quantity Sold')
          .dimension(stateAbrDim)
			.gap(2)
		  .renderHorizontalGridLines(true)
          .group(stateRaisedSum);
			
		
		
		
		//create data table---------------------------------------------------------->
		var datatable   = dc.dataTable("#dc-data-table");
		datatable
		.width(400).height(100)
		.dimension(stateDim)
		.group(function(d) {return d.dateDim;})
		// dynamic columns creation using an array of closures
		.columns([
			
			function(d) {return d.stateName;},
			function(d) {return d.infection;},
			function(d) {return d3.time.format("%Y")(d.date);},       
			
		]);
		
		
		
		

		dc.renderAll();
		//slider
		$("#slider").change(function(ev) {
			var year = $(this).val();
			
			$("#start-year").text(year);
			dateDim.filter(parseYear(year));
			var topInfectionValue = stateRaisedSum.top(Infinity);
			var minInfection = topInfectionValue[0].value;
			var maxInfection = topInfectionValue[49].value;
	
			usChartColorScale.domain([minInfection, maxInfection]);
			
			dc.redrawAll();
		});
		
		



	});//end of map
});

var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-33628816-1']);
  _gaq.push(['_trackPageview']);

  (function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();