(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SERVICE_URL =  "https://services3.arcgis.com/EvmgEO8WtpouUbyD/ArcGIS/rest/services/Cornavirus_State_Actions_FL/FeatureServer/0";	
	var GEOJSON_URL_STATES = "resources/Composite_CONUS_AK_HI_5.json";
	
	var FIELDNAME$STATE = "State";
	var FIELDNAME$STATE_ABBREVIATION = "STUSPS";
	var FIELDNAME$EMERGENCY_DECLARATION = "Emergency_Declaration";
	var FIELDNAME$MAJOR_DISASTER_DECLARATION = "MajorDisasterDeclaration";
	var FIELDNAME$NATIONAL_GUARD_ACTIVATION = "National_Guard_State_Activation";
	var FIELDNAME$STATE_EMPLOYEE_TRAVEL_RESTRICTIONS = "State_Employee_Travel_Restricti";
	var FIELDNAME$STATEWIDE_LIMITS_ON_GATHERINGS = "Gathering_Limits";
	var FIELDNAME$STATEWIDE_SCHOOL_CLOSURES  = "Statewide_School_Closures";
	var FIELDNAME$ESSENTIAL_BUSINESS_DESIGNATIONS_ISSUED = "Essential_Business_Designations";
	//var FIELDNAME$STATEWIDE_CLOSURE_NONESSENTIAL_BUSINESSES = "Statewide Closure of Non-Essential Businesses";
	var FIELDNAME$STATEWIDE_CURFEW = "Statewide_Curfew";
	var FIELDNAME$1135_WAIVER_STATUS = "F1135_Waiver_Status";
	//var FIELDNAME$SHELTER_IN_PLACE_ORDER = "'Stay at Home' or Shelter in Place Order";
	/*var FIELDNAME$PRIMARY_ELECTION = "Primary Election";*/
	var FIELDNAME$DOMESTIC_TRAVEL_LIMITATIONS = "Domestic_Travel_Limitations";
	
	var THEMES = [
		{
			field: FIELDNAME$EMERGENCY_DECLARATION, 
			alias: "Emergency Declaration",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			]
		},
		{
			field: FIELDNAME$MAJOR_DISASTER_DECLARATION,
			alias: "Major Disaster Declaration",
			legend: [
				{status: "Request Approved", color: "blue", caption: "Request Approved"},
				{status: "Request Made", color: "yellow", caption: "Request Made"}
			]
		},
		{
			field: FIELDNAME$NATIONAL_GUARD_ACTIVATION,
			alias: "National Guard Activation",
			legend: [
				{status: true, color: "blue", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			]
		},
		{
			field: FIELDNAME$STATE_EMPLOYEE_TRAVEL_RESTRICTIONS,
			alias: "State Employee Travel Restrictions",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			]
		},
		{
			field: FIELDNAME$STATEWIDE_LIMITS_ON_GATHERINGS,
			alias: "Statewide Limits on Gatherings",
			legend: [
				{status: "yes", color: "red", caption: "Statewide limit"},
				{status: "other", color: "orange", caption: "Other"},
			]
		},
		{
			field: FIELDNAME$STATEWIDE_SCHOOL_CLOSURES,
			alias: "Statewide School Closures",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			]
		},
		{
			field: FIELDNAME$ESSENTIAL_BUSINESS_DESIGNATIONS_ISSUED,
			alias: "Essential Business Designations Issued",
			legend: [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			]
		},
		{
			field: FIELDNAME$STATEWIDE_CURFEW,
			alias: "Statewide Curfew",
			legend: [
				{status: "yes", color: "red", caption: "Yes"},
				{status: "local", color: "orange", caption: "Local"},
				{status: "none", color: "gray", caption: "None"}
			]
		},
		{
			field: FIELDNAME$1135_WAIVER_STATUS,
			alias: "1135 Waiver Status",
			legend: [
				{status: true, color: "blue", caption: "Approved"},
				{status: false, color: "gray", caption: "No"}
			]
		},
		{
			field: FIELDNAME$DOMESTIC_TRAVEL_LIMITATIONS,
			alias: "Domestic Travel Limitations",
			legend: [
				{status: "executive order", color: "red", caption: "Executive Order"},
				{status: "recommendation", color: "orange", caption: "Recommendation"},
				{status: "none", color: "gray", caption: "None"}				
			]
		}
	];
	
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
		createLegend();
		_layerStates.eachLayer(function(layer){_layerStates.resetStyle(layer);});			
	}
	
	function createLegend()
	{
		$("div#legend").empty();
		var legend = $.grep(
			THEMES, 
			function(value){return value.field === $("select#category").val();}
		).shift().legend;			
		$.each(
			legend,
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
		
		var category = $("select#category").val();
		var legend = $.grep(
			THEMES, 
			function(value){return value.field === category;}
		).shift().legend;			
		var status = feature.extraProperties[category].trim();
		
		switch(category) {
			case FIELDNAME$EMERGENCY_DECLARATION:
				status = status.toLowerCase() === "yes";
				break;
			case FIELDNAME$NATIONAL_GUARD_ACTIVATION:
				status = status.toLowerCase() === "yes";
				break;
			case FIELDNAME$STATE_EMPLOYEE_TRAVEL_RESTRICTIONS:
				status = status.toLowerCase() === "yes";
				break;
			case FIELDNAME$STATEWIDE_LIMITS_ON_GATHERINGS:
				status = status.toLowerCase();
				status = status.search("yes") > -1 ? "yes" : "other";
				break;
			case FIELDNAME$STATEWIDE_SCHOOL_CLOSURES:
				status = status.toLowerCase().search("yes") > -1 ? true : false;
				break;
			/*case FIELDNAME$STATEWIDE_CLOSURE_NONESSENTIAL_BUSINESSES:
				status = status.toLowerCase().search("closure required") > -1 ||
						status.toLowerCase().search("closures required") > -1;
				break;*/
			case FIELDNAME$ESSENTIAL_BUSINESS_DESIGNATIONS_ISSUED:
				status = status.toLowerCase() === "yes";
				break;
			case FIELDNAME$STATEWIDE_CURFEW:
				status = status.toLowerCase() === "yes" ? "yes" :
						 status.toLowerCase() === "local" ? "local" : "none";
				break;
			case FIELDNAME$1135_WAIVER_STATUS:
				status = status.toLowerCase() === "approved";
				break;
			/*case FIELDNAME$SHELTER_IN_PLACE_ORDER:
				status = status.toLowerCase() === "yes";
				break;
			case FIELDNAME$PRIMARY_ELECTION:
				status = status.toLowerCase();
				break;*/
			case FIELDNAME$DOMESTIC_TRAVEL_LIMITATIONS:
				status = status.toLowerCase().search("executive") > -1 ? "executive order" :
						 status.toLowerCase().search("recommendation") > -1 ? "recommendation" : "none";
				break;
			default:
			 	//
		}

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
		var category = $("select#category").val();
		var content = e.target.feature.extraProperties[category].trim();
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