(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SPREADSHEET_URL =  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7OZXMn9kkBwlOfYcd-uLJ8j2slj_6wYd7ko_8eFrN5d4v5wp3hVvbKzF8nuSg8yWC3oWAF67O0EKd/pub?gid=0&single=true&output=csv";
	if (window.location.hostname.toLowerCase() === "localhost") {
		SPREADSHEET_URL = "/proxy/proxy.ashx?"+SPREADSHEET_URL;
	} else {
		SPREADSHEET_URL = "https://storymaps.esri.com/proxy/proxy.ashx?"+SPREADSHEET_URL;
	}
	
	var GEOJSON_URL_STATES = "resources/states_CONUS_AK_HI.json";
	
	var _map;
	var _featuresStates;
	var _layerStates;

	var _records;	
	var _selected;

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
					_records = $.grep(
						data.data, 
						function(value){return value.Lat && value.Long;}
					);
					_records = $.map(
						_records, 
						function(value, index){return new Record(value, index);}
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

			if (
				!_featuresStates || 
				!_records) {
				return;
			}

			_layerStates = L.geoJSON(_featuresStates).addTo(_map);
			_map.fitBounds(_layerStates.getBounds());

			// one time check to see if touch is being used

			$(document).one(
				"touchstart", 
				function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
			);

		}

	});

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/

	function onMapClick(e)
	{
		_selected = null;
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