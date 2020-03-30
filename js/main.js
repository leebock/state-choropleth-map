(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SPREADSHEET_URL =  "resources/CoronavirusStateActionsChart.csv";	
	var GEOJSON_URL_STATES = "resources/Composite_CONUS_AK_HI_5.json";
	
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
				complete: function(data) {
					_records = $.map(
						data.data, 
						function(value, index){return new Record(value);}
					);
					finish();
				}
			}
		);
		
		
		$.ajax({
			url: GEOJSON_URL_STATES,
			success: function(result) {
				_featuresStates = result.features;
				finish();
			}
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
								return value.getStateAbbrev() === feature.properties["State abbreviation"];
							}
						).shift();
						feature.extraProperties = record;
						layer.bindTooltip(record.getName());
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
			
			$("select#category").change(function(){processCategoryChange();});
			
			processCategoryChange();

		}

	});
	
	function processCategoryChange()
	{
		_map.closePopup();		
		createLegend();
		_layerStates.eachLayer(function(layer){_layerStates.resetStyle(layer);});			
	}
	
	var LEGEND_LUT = {
		"Emergency Declaration": [
			{status: true, color: "red", caption: "Yes"},
			{status: false, color: "gray", caption: "No"}
		],
		"Major Disaster Declaration": [
			{status: "Request Approved", color: "blue", caption: "Request Approved"},
			{status: "Request Made", color: "yellow", caption: "Request Made"}
		],
		"National Guard Activation": [
			{status: true, color: "blue", caption: "Yes"},
			{status: false, color: "gray", caption: "No"}
		],
		"State Employee Travel Restrictions": [
			{status: true, color: "red", caption: "Yes"},
			{status: false, color: "gray", caption: "No"}
		]			
	};
	
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
		var status;
		
		switch(category) {
			case "Emergency Declaration":
				status = feature.extraProperties.getEmergencyDeclarationStatus();
				break;
			case "Major Disaster Declaration":
				status = feature.extraProperties.getMajorDisasterDeclarationStatus();
				break;
			case "National Guard Activation":
				status = feature.extraProperties.getNationalGuardActivationStatus();
				break;
			case "State Employee Travel Restrictions":
				status = feature.extraProperties.getStateEmployeeTravelRestrictionsStatus();
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
		L.popup({closeButton: false})
			.setLatLng(e.latlng)
			.setContent(
				$("<div>")
					.append($("<div>").text(e.target.feature.extraProperties.getName()))
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