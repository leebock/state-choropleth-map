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
                        .text(content)
                        .css("width", content.length > 30 ? "200px" : "inherit")
                        .css("white-space", content.length > 30 ? "normal" : "nowrap")
                )
                .append(
                    $("<div>")
                        .text(content)
                        .css("width", content.length > 40 ? "150px" : "inherit")
                        .css("white-space", content.length > 40 ? "normal" : "nowrap")
                )
                .html();
        },
        createPopupContent: function(record)
        {
            var content = record.State;
            return $("<div>")
                    .append(
                        $("<div>")
                            .css("font-weight", "bold")
                            .text(content)
                    )
                    .append($("<div>").text(content))
                    .html();
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
            return value.Glasses.toLowerCase().trim() === "checked" ? true : false;
        },
        createTooltipContent: function(record)
        {
            var content = record.Governor;
            return $("<div>")
                .append(
                    $("<h4>")
                        .text(record.State)
                        .css("width", record.State.length > 30 ? "200px" : "inherit")
                        .css("white-space", record.State.length > 30 ? "normal" : "nowrap")
                )
                .append(
                    $("<div>")
                        .text(content)
                        .css("width", content.length > 40 ? "150px" : "inherit")
                        .css("white-space", content.length > 40 ? "normal" : "nowrap")
                )
                .html();
        },
        createPopupContent: function(record)
        {
            var content = record.Governor;
            return $("<div>")
                    .append(
                        $("<div>")
                            .css("font-weight", "bold")
                            .text(content)
                    )
                    .append($("<div>").text(content))
                    .html();
        }			
    }
];
