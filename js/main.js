(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SPREADSHEET_URL = "resources/state-facts.csv";	
	var GEOJSON_URL_STATES = "resources/Composite_CONUS_AK_HI_5.json";
	
	var FIELDNAME$STATE_ABBREVIATION = "Code";
		
	var _map;
	var _featuresStates;
	var _layerStates;
	var _theme;

	var _records;	
	
	$(document).ready(function() {
		
		if (!inIframe()) {
			new SocialButtonBar();
		} else {
			$(".banner").hide();
		}
				
		_map = new L.PaddingAwareMap(
			"map", 
			{
				zoomControl: false, 
				attributionControl: false, 
				maxZoom: 12, minZoom: 2, 
				zoomSnap: 0.25,
				worldCopyJump: true
			},
			getExtentPadding
		)
			.addControl(L.control.attribution({position: 'bottomleft'}).addAttribution("Esri"));
			
		_map.dragging.disable();
		_map.touchZoom.disable();
		_map.doubleClickZoom.disable();
		_map.scrollWheelZoom.disable();
		_map.boxZoom.disable();
		_map.keyboard.disable();
		if (_map.tap) {_map.tap.disable();}
		document.getElementById('map').style.cursor='default';

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
					style: function(feature) {
						if (!feature.extraProperties) {
							return null;
						}
						var legend = _theme.legend;			
						var status = _theme.evaluator(feature.extraProperties);
						
						var item = $.grep(
							legend, 
							function(value) {
								return value.status === status;
							}
						).shift();
				
						var color = !item ? null : item.color;
				
						return {
							fillColor: color || "gray", 
							fillOpacity: 1,
							color: "gray", 
							opacity: 1, 
							weight: 1							
						};						
					},
					onEachFeature: function(feature, layer) {
						var record = $.grep(
							_records, 
							function(value) {
								return value[FIELDNAME$STATE_ABBREVIATION] === feature.properties["State abbreviation"];
							}
						).shift();
						feature.extraProperties = record;
						layer.bindTooltip(
							function(layer) {
								return _theme.createTooltipContent(layer.feature.extraProperties);
							}, 
							{sticky: true, offset: L.point(0,-10)}
						);
						layer.on("click", layer_onClick);						
					}
				}
			).addTo(_map);

			// associate each of the territory rectangles w/ corresponding data
			
			$.each(
				_records, 
				function(index, value) {
					switch (value[FIELDNAME$STATE_ABBREVIATION]) {
						case "AS":
							$("ul#territories li#american-samoa").data("record", value);
							break;
						case "GU":
							$("ul#territories li#guam").data("record", value);
							break;
						case "MP":
							$("ul#territories li#northern-marianas").data("record", value);
							break;
						case "PR":
							$("ul#territories li#puerto-rico").data("record", value);
							break;
						case "VI":
							$("ul#territories li#virgin-islands").data("record", value);
							break;
						default:
							
					}
				}
			);
			$("ul#territories li").mouseover(
				function(event){
					var x = parseInt($(this).parent().position().left) + 
							$(this).position().left + 
							$(this).outerWidth()/2;
					var y = parseInt($(this).parent().position().top);
					if ($(".toggle").css("display") !== "none") {
						y = y - $(".toggle").outerHeight();
					}
					_map.openTooltip(
						_theme.createTooltipContent($(this).data("record")), 
						_map.containerPointToLatLng(L.point(x, y)),
						{offset: L.point(0,-15), direction: "top"}
					);
				}
			);
			$("ul#territories li").mouseout(
				function(event){
					_map.eachLayer(function(layer) {
					    if (layer.options.pane === "tooltipPane"){layer.removeFrom(_map);}
					});					
				}
			);
			
			// one time check to see if touch is being used

			$(document).one(
				"touchstart", 
				function(){$("html body").addClass(GLOBAL_CLASS_USETOUCH);}
			);
			
			$.each(
				window.THEMES,
				function(index, theme) {
					$("<option>").val(theme.title).text(theme.title).appendTo($("select#category"));
					$("<input>")
						.attr({
							"type": "radio", 
							"name": "category", 
							"value": theme.title, 
							"id": "radio-"+index
						})
						.appendTo($("div.toggle"));
					$("<label>")
						.attr("for", "radio-"+index)
						.text(theme.title)
						.appendTo($("div.toggle"));
				}
			);
			
			$("select#category").change(
				function() {
					$("input[name='category']").prop("checked", false);
					var index = $(this).prop("selectedIndex");
					$($("input[name='category']").get(index)).prop("checked", true);
					processCategoryChange();
				}
			);
			$("input[name='category']").change(
				function() {
					$("select#category").val($("input[name='category']:checked").val());
					processCategoryChange();
				}
			);
			var index = parseArgs().index || 0;
			if (index > window.THEMES.length - 1) {
				index = 0;
			}
			$($("input[name='category']").get(index)).prop("checked", true);
			$("select#category").prop("selectedIndex", index);
			processCategoryChange();
			_map.fitBounds(_layerStates.getBounds());
			$(window).resize(
				function(){
					_map.invalidateSize();
					_map.fitBounds(_layerStates.getBounds());
				}
			);
			
		}

	});
	
	function processCategoryChange()
	{
		_map.closePopup();
		_theme = window.THEMES[$("select#category").prop("selectedIndex")];
		createLegend();
		styleTerritories();
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
	
	function styleTerritories()
	{
		var legend = _theme.legend;			
		$.each(
			$("ul#territories li"), 
			function(index, value) {
				var record = $(value).data("record"); 
				var status = _theme.evaluator(record);
				
				var item = $.grep(
					legend, 
					function(value) {
						return value.status === status;
					}
				).shift();
		
				var color = !item ? null : item.color;
				$(this).css("background-color", color);

			}
		);
	}	
	
	function getExtentPadding()
	{
		var top = 45;
		var right = 0;
		var bottom = $("#legend").outerHeight();
		var left = 0;
		return {paddingTopLeft: [left,top], paddingBottomRight: [right,bottom]};
	}	

	/***************************************************************************
	*********************************** EVENTS  ********************************
	***************************************************************************/
	
	function layer_onClick(e)
	{
		$(".leaflet-tooltip").remove();
		L.popup({closeButton: false})
			.setLatLng(e.latlng)
			.setContent(_theme.createPopupContent(e.target.feature.extraProperties))
			.openOn(_map);		
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