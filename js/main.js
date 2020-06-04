(function () {

	"use strict";

	//var WIDTH_THRESHOLD = 768;

	var GLOBAL_CLASS_USETOUCH = "touch";
	var SERVICE_URL =  "https://services3.arcgis.com/EvmgEO8WtpouUbyD/ArcGIS/rest/services/Cornavirus_State_Actions_FL/FeatureServer/0";	
	var GEOJSON_URL_STATES = "resources/Composite_CONUS_AK_HI_5.json";
	
	var FIELDNAME$STATE = "State";
	var FIELDNAME$STATE_ABBREVIATION = "STUSPS";
	
	//var RGB_COLOR_RED = "rgba(255,0,0,0.4)";
	var RGB_COLOR_GRAY = "rgba(110,110,110,1)";
	//var RGB_COLOR_BLUE = "rgba(0,0,0255,0.4)";
	//var RGB_COLOR_YELLOW = "rgba(255,255,0,0.4)";
	//var RGB_COLOR_ORANGE = "rgba(255,165,0,0.4)";
	var RGB_COLOR_DARKESTGREEN = "rgba(0,100,0,1)";
	var RGB_COLOR_FORESTGREEN = "rgba(34,160,34,1)";
	var RGB_COLOR_LIMEGREEN = "rgba(0,255,0,1)";
	var RGB_COLOR_PALEGREEN = "rgba(152,251,152,1)";
	
	var RGB_COLOR_PURPLE1 = "rgba(233,200,252,1)";
	var RGB_COLOR_PURPLE2 = "rgba(226,140,252,1)";
	var RGB_COLOR_PURPLE3 = "rgba(183,48,232,1)";
	var RGB_COLOR_PURPLE4 = "rgba(108,48,140,1)";
	
	var RGB_COLOR_BEIGE = "rgba(245,245,220,0.4)";
	
	var THEMES = [
		{
			field: "Statewide_Limits_on_Gatherings_",
			alias: "Statewide Stay at Home Orders and Guidance",
			legend: [
				{
					status: "order", 
					color: RGB_COLOR_DARKESTGREEN, 
					caption: "Stay at home order"
				},
				{
					status: "order for vulnerable", 
					color: RGB_COLOR_FORESTGREEN, 
					caption: "Stay at home guidance for all; order for vulnerable populations"
				},
				{
					status: "guidance",
					color: RGB_COLOR_LIMEGREEN, 
					caption: "Stay at home guidance"
				},
				{
					status: "guidance for vulnerable",
					color: RGB_COLOR_PALEGREEN,
					caption: "Stay at home guidance for vulnerable only"
				},
				{
					status: "other", 
					color: RGB_COLOR_BEIGE, 
					caption: "Other"
				}
			],
			evaluator: function(value) {
				value = value.toLowerCase().trim(); 
				if (value.search("yes") !== 0) {
					return "other";
				}
				value = value.split("-").pop().trim();
				return value.search("stay at home order") > -1 ? "order" :
						value.search("order for vulnerable") > -1 ? "order for vulnerable" :
						value === "stay at home guidance" ? "guidance" :
						"guidance for vulnerable";
			}
		},
		{
			field: "Gathering_Limits",
			alias: "Statewide Limits on Gatherings",
			legend: [
				{
					status: "250", 
					color: RGB_COLOR_PURPLE1, 
					caption: "250 or more"
				},
				{
					status: "100", 
					color: RGB_COLOR_PURPLE2, 
					caption: "100 or more"
				},
				{
					status: "50",
					color: RGB_COLOR_PURPLE3, 
					caption: "50 or more"
				},
				{
					status: "25",
					color: RGB_COLOR_PURPLE4,
					caption: "25 or more"
				},
				{
					status: "10",
					color: RGB_COLOR_LIMEGREEN,
					caption: "10 or more"
				},
				{
					status: "5",
					color: RGB_COLOR_FORESTGREEN,
					caption: "5 or more"
				},
				{
					status: "3",
					color: RGB_COLOR_DARKESTGREEN,
					caption: "3 or more"
				},
				{
					status: "unspecified",
					color: RGB_COLOR_GRAY,
					caption: "Unspecified"
				},
				{
					status: "other", 
					color: RGB_COLOR_BEIGE, 
					caption: "Other"
				}
			],
			evaluator: function(value) {
				value = value.toLowerCase().trim(); 
				if (value.search("yes") !== 0) {
					return "other";
				}
				value = value.split("-")[1].trim();
				return value.search("250") === 0 ? "250" :
						value.search("100") === 0 ? "100" :
						value.search("50") === 0 ? "50" :
						value.search("25") === 0 ? "25" :
						value.search("10") === 0 ? "10" :
						value.search("5") === 0 ? "5" :
						value.search("3") === 0 ? "3" :
						"unspecified";
			}
		}/*,
		{
			field: "State_Employee_Travel_Restricti",
			alias: "State Employee Travel Restrictions",
			legend: [
				{status: true, color: RGB_COLOR_RED, caption: "Yes"},
				{status: false, color: RGB_COLOR_GRAY, caption: "No"}
			],
			evaluator: function(value){return value.toLowerCase() === "yes";}
		},
		{
			field: "Statewide_School_Closures",
			alias: "Statewide School Closures",
			legend: [
				{status: true, color: RGB_COLOR_RED, caption: "Yes"},
				{status: false, color: RGB_COLOR_GRAY, caption: "No"}
			],
			evaluator: function(value) {
				return value.toLowerCase().search("yes") > -1 ? true : false;
			}
		},
		{
			field: "Essential_Business_Designations",
			alias: "Essential Business Designations Issued",
			legend: [
				{status: true, color: RGB_COLOR_RED, caption: "Yes"},
				{status: false, color: RGB_COLOR_GRAY, caption: "No"}
			],
			evaluator: function(value){return value.toLowerCase() === "yes";}
		},
		{
			field: "Statewide_Curfew",
			alias: "Statewide Curfew",
			legend: [
				{status: "yes", color: RGB_COLOR_RED, caption: "Yes"},
				{status: "local", color: RGB_COLOR_ORANGE, caption: "Local"},
				{status: "none", color: RGB_COLOR_GRAY, caption: "None"}
			],
			evaluator: function(value) {
				return value.toLowerCase() === "yes" ? 
						"yes" :
						value.toLowerCase() === "local" ? "local" : "none";
			}
		},
		{
			field: "F1135_Waiver_Status",
			alias: "1135 Waiver Status",
			legend: [
				{status: true, color: RGB_COLOR_BLUE, caption: "Approved"},
				{status: false, color: RGB_COLOR_GRAY, caption: "No"}
			],
			evaluator: function(value){return value.toLowerCase() === "approved";}
		},
		{
			field: "Domestic_Travel_Limitations",
			alias: "Domestic Travel Limitations",
			legend: [
				{status: "executive order", color: RGB_COLOR_RED, caption: "Executive Order"},
				{status: "recommendation", color: RGB_COLOR_ORANGE, caption: "Recommendation"},
				{status: "none", color: RGB_COLOR_GRAY, caption: "None"}				
			],
			evaluator: function(value) {
				return value.toLowerCase().search("executive") > -1 ? 
							"executive order" :
							value.toLowerCase().search("recommendation") > -1 ? 
								"recommendation" : 
								"none";
			}
		}*/
	];
	
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
					style: function(feature) {
						if (!feature.extraProperties) {
							return null;
						}
						var legend = _theme.legend;			
						var status = _theme.evaluator(feature.extraProperties[_theme.field].trim());
						
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
								return value[FIELDNAME$STATE_ABBREVIATION]
										.split("(")
										.pop()
										.replace(")","") === 
										feature.properties["State abbreviation"];
							}
						).shift();
						feature.extraProperties = record;
						layer.bindTooltip(
							function(layer) {
								return createTooltipContent(layer.feature.extraProperties);
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
						createTooltipContent($(this).data("record")), 
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
		_theme = $.grep(
			THEMES, 
			function(value){return value.field === $("select#category").val();}
		).shift();		
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
				var status = _theme.evaluator(record[_theme.field].trim());
				
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
	
	function createTooltipContent(record)
	{
		var content = record[_theme.field].trim();
		return $("<div>")
			.append(
				$("<h4>")
					.text(record[FIELDNAME$STATE])
					.css("width", record[FIELDNAME$STATE].length > 30 ? "200px" : "inherit")
					.css("white-space", record[FIELDNAME$STATE].length > 30 ? "normal" : "nowrap")
			)
			.append(
				$("<div>")
					.text(content)
					.css("width", content.length > 40 ? "150px" : "inherit")
					.css("white-space", content.length > 40 ? "normal" : "nowrap")
			)
			.html();
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