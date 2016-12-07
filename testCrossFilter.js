

//formats the json file into a readable format
d3.json('infections.json', function(data) {
	var flattenedData = [];
	var parseYear = d3.time.format("%Y").parse;
	for(var state of data.states){
		if (!state.name) {
			console.log('wtf');
		}
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
	var topInfectionValue = stateRaisedSum.top(1);
	var maxInfection = topInfectionValue[0].value;
	//var minInfection = topInfectionValue[49].value;
	

	
	usChartColorScale = d3.scale.quantize().range([ "#859574",  "#FFC300", "#DF6146", "#C70039","#900C3F"]).domain([0, maxInfection]);
	usChartColorScale(0)
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
			.width(600).height(400)
			.dimension(dateDim)  
			.group(infectionDimGroup)
			.mouseZoomable(true)
			.round(d3.time.format("%Y").parse.round)
			.x(d3.time.scale().domain([minDate,maxDate]))
			.renderArea(true)
			.brushOn(false)
			.elasticY(true)
			.colors(usChartColorScale)
			.transitionDuration(1000)
			.margins({top: 10, right: 100, bottom: 70, left:90})
			//.legend(dc.legend().x(420).y(10).itemHeight(13).gap(5))
			.yAxisLabel("Infection Rate")
			.xAxisLabel("Year")
			  
		

			//barchart---
		chart
          .width(1200)
          .height(250)
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          .brushOn(false)
          .xAxisLabel('State')
		  .y(d3.scale.linear().domain([0, 22000]))
          .yAxisLabel('# of Infections')
		  .elasticY(true)
		   .colors(usChartColorScale)
          .dimension(stateAbrDim)
			.gap(2)
		  .renderHorizontalGridLines(true)
		   //.round(dc.round.floor) //changes y axis to scale with infection rate
			.margins({top: 10, right: 100, bottom: 70, left:80})
          .group(stateRaisedSum);
		
		
		
		var datatable = dc.dataTable("#dc-data-table");
		datatable
		.width(400).height(200)
		.size(5)
		.order(d3.ascending)
		.dimension(infectionDim)
				  .sortBy(function (d) {
            return d.infection.ascending;
        })
		.group(function() {return "State Name";})
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
			if (year >=1956 && year <=1973){//changes slider value to 1974 for the years that don't contain data
				year ="1974";
				$(this).val(1974);
				
			}
			$("#start-year").text(year);
			dateDim.filter(parseYear(year));
			var topInfectionValue = stateRaisedSum.top(1);
			var maxInfection = topInfectionValue[0].value;
			//var minInfection = topInfectionValue[49].value;
	
			usChartColorScale.domain([0, maxInfection]);
			
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