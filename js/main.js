(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SERVICE_URL =  "https://services3.arcgis.com/EvmgEO8WtpouUbyD/ArcGIS/rest/services/Cornavirus_State_Actions_FL/FeatureServer/0";	
	var GEOJSON_URL_STATES = "resources/Composite_CONUS_AK_HI_5.json";
	
	var FIELDNAME$STATE = "State";
	var FIELDNAME$STATE_ABBREVIATION = "STUSPS";
	
	var THEMES = [
		{
			field: "Emergency_Declaration", 
			alias: "Emergency Declaration",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			],
			testFunc: function(value){return value.toLowerCase() === "yes";}
		},
		{
			field: "MajorDisasterDeclaration",
			alias: "Major Disaster Declaration",
			legend: [
				{status: "Request Approved", color: "blue", caption: "Request Approved"},
				{status: "Request Made", color: "yellow", caption: "Request Made"}
			],
			testFunc: function(value){return value;}
		},
		{
			field: "National_Guard_State_Activation",
			alias: "National Guard Activation",
			legend: [
				{status: true, color: "blue", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			],
			testFunc: function(value){return value.toLowerCase() === "yes";}
		},
		{
			field: "State_Employee_Travel_Restricti",
			alias: "State Employee Travel Restrictions",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			],
			testFunc: function(value){return value.toLowerCase() === "yes";}
		},
		{
			field: "Gathering_Limits",
			alias: "Statewide Limits on Gatherings",
			legend: [
				{status: "yes", color: "red", caption: "Statewide limit"},
				{status: "other", color: "orange", caption: "Other"},
			],
			testFunc: function(value) {
				return value.toLowerCase().search("yes") > -1 ? "yes" : "other";
			}
		},
		{
			field: "Statewide_School_Closures",
			alias: "Statewide School Closures",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			],
			testFunc: function(value) {
				return value.toLowerCase().search("yes") > -1 ? true : false;
			}
		},
		{
			field: "Essential_Business_Designations",
			alias: "Essential Business Designations Issued",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			],
			testFunc: function(value){return value.toLowerCase() === "yes";}
		},
		{
			field: "Statewide_Curfew",
			alias: "Statewide Curfew",
			legend: [
				{status: "yes", color: "red", caption: "Yes"},
				{status: "local", color: "orange", caption: "Local"},
				{status: "none", color: "gray", caption: "None"}
			],
			testFunc: function(value) {
				return value.toLowerCase() === "yes" ? 
						"yes" :
						value.toLowerCase() === "local" ? "local" : "none";
			}
		},
		{
			field: "F1135_Waiver_Status",
			alias: "1135 Waiver Status",
			legend: [
				{status: true, color: "blue", caption: "Approved"},
				{status: false, color: "gray", caption: "No"}
			],
			testFunc: function(value){return value.toLowerCase() === "approved";}
		},
		{
			field: "Domestic_Travel_Limitations",
			alias: "Domestic Travel Limitations",
			legend: [
				{status: "executive order", color: "red", caption: "Executive Order"},
				{status: "recommendation", color: "orange", caption: "Recommendation"},
				{status: "none", color: "gray", caption: "None"}				
			],
			testFunc: function(value) {
				return value.toLowerCase().search("executive") > -1 ? 
							"executive order" :
							value.toLowerCase().search("recommendation") > -1 ? 
								"recommendation" : 
								"none";
			}
		}
	];

	/*case FIELDNAME$STATEWIDE_CLOSURE_NONESSENTIAL_BUSINESSES:
		status = status.toLowerCase().search("closure required") > -1 ||
				status.toLowerCase().search("closures required") > -1;
		break;*/
		/*case FIELDNAME$SHELTER_IN_PLACE_ORDER:
			status = status.toLowerCase() === "yes";
			break;
		case FIELDNAME$PRIMARY_ELECTION:
			status = status.toLowerCase();
			break;*/

	
	/*
	LEGEND_LUT[FIELDNAME$STATEWIDE_CLOSURE_NONESSENTIAL_BUSINESSES] = [
		{status: true, color: "red", caption: "Closure Required"},
		{status: false, color: "gray", caption: "Other"}
	];
	LEGEND_LUT[FIELDNAME$SHELTER_IN_PLACE_ORDER] = [
		{status: true, color: "red", caption: "Yes"},
		{status: false, color: "gray", caption: "No"}				
	];
	LEGEND_LUT[FIELDNAME$PRIMARY_ELECTION] = [
		{status: "already held", color: "red", caption: "Already Held"},
		{status: "on schedule", color: "orange", caption: "On Schedule"},
		{status: "delayed / rescheduled", color: "gray", caption: "Delayed / Rescheduled"}
	];*/
	
	var _map;
	var _featuresStates;
	var _layerStates;
	var _theme;

	var _records;	
	
	$(document).ready(function() {
		
		console.log(parseArgs());

		if (!inIframe()) {
			new SocialButtonBar();
		} else {
			$(".banner").hide();
		}
				
		_map = new L.Map(
			"map", 
			{
				zoomControl: !L.Browser.mobile, 
				attributionControl: false, 
				maxZoom: 12, minZoom: 2, 
				zoomSnap: 0.25,
				worldCopyJump: true
			}
		)
			.addControl(L.control.attribution({position: 'bottomleft'}).addAttribution("Esri"))
			.on("click", onMapClick)
			.on("moveend", onExtentChange);
			
		if (!L.Browser.mobile) {
			L.easyButton({
				states:[
					{
						icon: "fa fa-home",
						onClick: function(btn, map){
							_map.fitBounds(_layerStates.getBounds());
						},
						title: "Full extent"
					}
				]
			}).addTo(_map);			
		}

		 $.getJSON(
			 SERVICE_URL+"/query"+
			"?where="+encodeURIComponent("1 = 1")+
			"&outFields=*"+
			"&returnGeometry=false"+
			"&f=pjson", 
			function(data) {
				_records = $.map(data.features, function(value){return value.attributes;});
				finish();
			}
		 );		
	  	
		$.ajax({
			url: GEOJSON_URL_STATES,
			success: function(result) {_featuresStates = result.features;finish();}
		});		

		function finish()
		{

			if (!_featuresStates || !_records) {
				return;
			}

			_layerStates = L.geoJSON(
				_featuresStates,
				{
					style: createStyle,
					onEachFeature: function(feature, layer) {
						var record = $.grep(
							_records, 
							function(value) {
								return value[FIELDNAME$STATE_ABBREVIATION]
										.split("(")
										.pop()
										.replace(")","") === 
										feature.properties["State abbreviation"];
							}
						).shift();
						feature.extraProperties = record;
						layer.bindTooltip(feature.properties["State abbreviation"]);
						layer.on("click", layer_onClick);						
					}
				}
			).addTo(_map);

			// one time check to see if touch is being used

			$(document).one(
				"touchstart", 
				function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
			);
			
			$.each(
				THEMES,
				function(index, theme) {
					$("<option>").val(theme.field).text(theme.alias).appendTo($("select#category"));
					$("<input>")
						.attr({
							"type": "radio", 
							"name": "category", 
							"value": theme.field, 
							"id": "radio-"+index
						})
						.appendTo($("div.toggle"));
					$("<label>")
						.attr("for", "radio-"+index)
						.text(theme.alias)
						.appendTo($("div.toggle"));
				}
			);
			
			$("select#category").change(
				function() {
					var category = $(this).val();
					$("input[name='category']").prop("checked", false);
					$("input[name='category'][value='"+category+"']").prop("checked", true);
					processCategoryChange();
				}
			);
			$("input[name='category']").change(
				function() {
					$("select#category").val($("input[name='category']:checked").val());
					processCategoryChange();
				}
			);
			$("input[name='category']:nth-of-type(1)").prop("checked", true);
			processCategoryChange();
			_map.fitBounds(_layerStates.getBounds());
			
		}

	});
	
	function processCategoryChange()
	{
		_map.closePopup();
		_theme = $.grep(
			THEMES, 
			function(value){return value.field === $("select#category").val();}
		).shift();		
		createLegend();
		_layerStates.eachLayer(function(layer){_layerStates.resetStyle(layer);});			
	}
	
	function createLegend()
	{
		$("div#legend").empty();
		$.each(
			_theme.legend,
			function(index, value) {
				$("div#legend")
					.append($("<div>").addClass("swatch").css("background-color", value.color))
					.append($("<div>").addClass("caption").text(value.caption));
			}
		);
	}

	function createStyle(feature)
	{
		
		if (!feature.extraProperties) {
			return null;
		}
		var legend = _theme.legend;			
		var status = _theme.testFunc(feature.extraProperties[_theme.field].trim());
		
		var item = $.grep(
			legend, 
			function(value) {
				return value.status === status;
			}
		).shift();

		var color = !item ? null : item.color;

		return {
			fillColor: color || "gray", 
			fillOpacity: 0.4,
			color: "gray", 
			opacity: 1, 
			weight: 1							
		};
		
	}

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/

	function onMapClick(e)
	{
	}
	
	function layer_onClick(e)
	{
		$(".leaflet-tooltip").remove();
		var content = e.target.feature.extraProperties[_theme.field].trim();
		L.popup({closeButton: false})
			.setLatLng(e.latlng)
			.setContent(
				$("<div>")
					.append(
						$("<div>")
							.css("font-weight", "bold")
							.text(e.target.feature.extraProperties[FIELDNAME$STATE])
					)
					.append($("<div>").text(content))
					.html()											
			)
			.openOn(_map);		
	}

	/***************************************************************************
	**************************** EVENTS (other) ********************************
	***************************************************************************/

	function onExtentChange()
	{
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/
	
	function inIframe () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}		

	
	function parseArgs()
	{
		
		var parts = decodeURIComponent(document.location.href).split("?");
		var args = {};
		
		if (parts.length > 1) {
			args = parts[1].toLowerCase().split("&").reduce(
				function(accumulator, value) {
					var temp = value.split("=");
					if (temp.length > 1) {accumulator[temp[0]] = temp[1];}
					return accumulator; 
				}, 
				args
			);
		}

		return args;
	
	}	

})();