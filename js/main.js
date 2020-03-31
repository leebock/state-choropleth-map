(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SPREADSHEET_URL =  "resources/CoronavirusStateActionsChart.csv";	
	var GEOJSON_URL_STATES = "resources/Composite_CONUS_AK_HI_5.json";
	
	var FIELDNAME$STATE = "State";
	var FIELDNAME$EMERGENCY_DECLARATION = "Emergency Declaration";
	var FIELDNAME$MAJOR_DISASTER_DECLARATION = "Major Disaster Declaration";
	var FIELDNAME$NATIONAL_GUARD_ACTIVATION = "National Guard Activation";
	var FIELDNAME$STATE_EMPLOYEE_TRAVEL_RESTRICTIONS = "State Employee Travel Restrictions";
	var FIELDNAME$STATEWIDE_LIMITS_ON_GATHERINGS = "Statewide Limits on Gatherings";
	var FIELDNAME$STATEWIDE_SCHOOL_CLOSURES  = "Statewide School Closures";
	var FIELDNAME$ESSENTIAL_BUSINESS_DESIGNATIONS_ISSUED = "Essential Business Designations Issued";
	//var FIELDNAME$STATEWIDE_CLOSURE_NONESSENTIAL_BUSINESSES = "Statewide Closure of Non-Essential Businesses";
	var FIELDNAME$STATEWIDE_CURFEW = "Statewide Curfew";
	var FIELDNAME$1135_WAIVER_STATUS = "1135 Waiver Status";
	
	var LEGEND_LUT = {};
	
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

		Papa.parse(
			SPREADSHEET_URL, 
			{
				header: true,
				download: true,
				complete: function(data) {_records = data.data;finish();}
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
								return value[FIELDNAME$STATE]
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
			_map.fitBounds(_layerStates.getBounds());

			// one time check to see if touch is being used

			$(document).one(
				"touchstart", 
				function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
			);
			
			LEGEND_LUT[FIELDNAME$EMERGENCY_DECLARATION] = [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			];
			LEGEND_LUT[FIELDNAME$MAJOR_DISASTER_DECLARATION] = [
				{status: "Request Approved", color: "blue", caption: "Request Approved"},
				{status: "Request Made", color: "yellow", caption: "Request Made"}
			];
			LEGEND_LUT[FIELDNAME$NATIONAL_GUARD_ACTIVATION] = [
				{status: true, color: "blue", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			];
			LEGEND_LUT[FIELDNAME$STATE_EMPLOYEE_TRAVEL_RESTRICTIONS] = [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			];
			LEGEND_LUT[FIELDNAME$STATEWIDE_LIMITS_ON_GATHERINGS] = [
				{status: "yes", color: "red", caption: "Yes"},
				{status: "recommended", color: "orange", caption: "Recommended"},
				{status: "no", color: "gray", caption: "No"}
			];			
			LEGEND_LUT[FIELDNAME$STATEWIDE_SCHOOL_CLOSURES] = [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			];
			/*LEGEND_LUT[FIELDNAME$STATEWIDE_CLOSURE_NONESSENTIAL_BUSINESSES] = [
				{status: true, color: "red", caption: "Closure Required"},
				{status: false, color: "gray", caption: "Other"}
			];*/
			LEGEND_LUT[FIELDNAME$ESSENTIAL_BUSINESS_DESIGNATIONS_ISSUED] = [
				{status: true, color: "red", caption: "Yes"},
				{status: false, color: "gray", caption: "No"}
			];
			LEGEND_LUT[FIELDNAME$STATEWIDE_CURFEW] = [
				{status: "yes", color: "red", caption: "Yes"},
				{status: "local", color: "orange", caption: "Local"},
				{status: "none", color: "gray", caption: "None"}
			];
			LEGEND_LUT[FIELDNAME$1135_WAIVER_STATUS] = [
				{status: true, color: "blue", caption: "Approved"},
				{status: false, color: "gray", caption: "No"}
			];
			
			$.each(
				[
					FIELDNAME$MAJOR_DISASTER_DECLARATION, 
					FIELDNAME$STATEWIDE_LIMITS_ON_GATHERINGS,
					FIELDNAME$EMERGENCY_DECLARATION, 
					FIELDNAME$NATIONAL_GUARD_ACTIVATION, 
					FIELDNAME$STATE_EMPLOYEE_TRAVEL_RESTRICTIONS,
					FIELDNAME$STATEWIDE_SCHOOL_CLOSURES,
					/*FIELDNAME$STATEWIDE_CLOSURE_NONESSENTIAL_BUSINESSES,*/
					FIELDNAME$ESSENTIAL_BUSINESS_DESIGNATIONS_ISSUED,
					FIELDNAME$STATEWIDE_CURFEW,
					FIELDNAME$1135_WAIVER_STATUS
				],
				function(index, value) {
					$("<option>").val(value).text(value).appendTo($("select#category"));
					$("<input>")
						.attr({
							"type": "radio", 
							"name": "category", 
							"value": value, "id": 
							"radio-"+index
						})
						.appendTo($("div.toggle"));
					$("<label>")
						.attr("for", "radio-"+index)
						.text(value)
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
		var legend = LEGEND_LUT[$("select#category").val()];
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
		var legend = LEGEND_LUT[category];			
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
				status = status.substring(0,3) === "yes" ? "yes" :
						 status.substring(0,3) === "rec" ? "recommended" : "no";
				break;
			case FIELDNAME$STATEWIDE_SCHOOL_CLOSURES:
				status = status.toLowerCase() === "yes";
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