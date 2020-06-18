window.THEMES = [
    {
        title: "Has a 'U' in its Name",
        legend: [
            {
                status: false, 
                color: "rgba(110,110,110,0.3)", 
                caption: "No 'U'"
            },
            {
                status: true, 
                color: "rgba(255,165,0,0.5)", 
                caption: "Yes 'U'!"
            }
        ],
        evaluator: function(value) {
            return value.State.toLowerCase().trim().search("u") > -1 ? true : false;
        },
        createTooltipContent: function(record)
        {
            var content = record.State;
            return $("<div>")
                .append(
                    $("<h4>")
                        .html(
                            content.replace(
                                RegExp("u","ig"), 
                				function(str) {return "<mark>"+str+"</mark>";}                                
                            )
                        )
                        .css("width", content.length > 30 ? "200px" : "inherit")
                        .css("white-space", content.length > 30 ? "normal" : "nowrap")
                )
                .html();
        },
        createPopupContent: function(record)
        {
            return this.createTooltipContent(record);
        }		
    },
    {
        title: "Governor wears glasses in photo",
        legend: [
            {
                status: false, 
                color: "rgba(110,110,110,0.3)", 
                caption: "Two eyes"
            },
            {
                status: true, 
                color: "rgb(255,0,255,0.5)", 
                caption: "Four eyes"
            }
        ],
        evaluator: function(value) {
            return value.Glasses.toLowerCase().trim() === "1" ? true : false;
        },
        createTooltipContent: function(record)
        {
            var state = record.State;
            var governor = record.Governor;
            var photo = record.Portrait;
            return $("<div>")
                .append(
                    $("<h4>")
                        .text(state)
                        .css("width", record.State.length > 30 ? "200px" : "inherit")
                        .css("white-space", record.State.length > 30 ? "normal" : "nowrap")
                )
                .append(
                    photo ? 
                    $("<img>").attr("src", photo).css("max-width","100px") : 
                    ""
                )
                .append(
                    $("<div>")
                        .text(governor)
                        .css("width", governor.length > 40 ? "150px" : "inherit")
                        .css("white-space", governor.length > 40 ? "normal" : "nowrap")
                )
                .html();
        },
        createPopupContent: function(record)
        {
            return this.createTooltipContent(record);
        }			
    }
];
