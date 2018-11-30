/*
* CS4460 P5
* Fall 2018
*
* Sean Gedorio
* Noah Roberts
*/


// config

var width = 600;
var height = 600;
var diameter = 250;
var colorRamp = ['#5D2B7D','#A72D89','#1474BB','#8FC33E','#FEEE22','#E41E26'];
var neutralColor = "lightgray";
var selectedColors = ["red", "blue", "green", "orange", "yellow"];
var maxSelected = 5;
var chart2BottomPadding = 50;
var chart2LeftPadding = 100;
var chart2TopPadding = 50;

var selected = [];

function CandyEntry(joy, meh, despair) {
    this.joy = joy;
    this.meh = meh;
    this.despair = despair;
}

window.onload = start;

function start() {
    var chart1 = d3.select("#bubblechart")
                        .append("svg:svg")
                        .attr("width", width)
                        .attr("height", height);

    var chart2 = d3.select("#details")
                    .append("svg:svg")
                    .attr("width", width)
                    .attr("height", height);

    var chart3 = d3.select("#map")
                    .append("svg:svg")
                    .attr("width", width * 2)
                    .attr("height", height);

    var radiusScale = d3.scale.linear()
        .domain([1, 2600])
        .range([1, 45]);

    var colorScale = d3.scale.linear()
        .domain([1, 2600])
        .range([0, colorRamp.length])
    
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width - chart2LeftPadding], 0.3);
    
    var y = d3.scale.linear()
        .domain([1, 2600])
        .range([height - chart2BottomPadding - chart2TopPadding, 0]);

    var candyMap = d3.map();

    d3.csv("./data/candy.csv", function(error, data) {
        if (error) {
            console.error("Error getting or parsing the data.");
            throw error;
        }

        for (let col of Object.keys(data[0])) {
            if (/^Q6_/.test(col)) {
                candyMap.set(col.substring(3), new CandyEntry(0, 0, 0));
            }
        }

        data.forEach(function(d) {
            for (let col of Object.keys(d)) {
                if (/^Q6_/.test(col)) {
                    let key = col.substring(3);
                    let candyEntry = candyMap.get(key);
                    if (d[col] === "JOY") {
                        candyEntry.joy++;
                    } else if (d[col] === "MEH") {
                        candyEntry.meh++;
                    } else if (d[col] === "DESPAIR") {
                        candyEntry.despair++;
                    }
                    candyMap.set(key, candyEntry);
                }
            }
        });

        //create chart1 

        var candyMapArray = candyMap.entries();
        candyMapArray.shift();

        force = d3.layout.force() //set up force
            .size([width, height])
            .nodes(candyMapArray)
            .charge(-200)
            .start();

        var drag = force.drag();

        var g = chart1.selectAll("g")
            .data(candyMapArray)
            .enter().append("g")
            .call(drag);

        g.append("circle")
            .attr("class", "candy")
            .attr("r", function(d) {
                return radiusScale(d.value.joy * 2 + d.value.meh);
            })
            .attr("fill", function(d) {
                return colorRamp[Math.floor(colorScale(d.value.joy * 2 + d.value.meh))];
            });

        g.append("text")
            .text(function(d) { return d.key; });
        
        force.on("tick", tick);

        function tick() {
            chart1.selectAll("circle")
                .attr("cx", function(d) {
                    return d.x;
                }) 
                .attr("cy", function(d) {
                    return d.y;
                });
            chart1.selectAll("text")
                .attr("x", function(d) {
                    return d.x;
                }) 
                .attr("y", function(d) {
                    return d.y;
                });
        }

        // create chart2

        chart2.append("g")
            .attr("transform", "translate(" + chart2LeftPadding + "," + (height - chart2BottomPadding) + ")")
            .attr("class", "axis")
            .call(d3.svg.axis().scale(x));

        chart2.append("text")             
            .attr("transform", "translate(" + ((width - chart2LeftPadding) / 2 + chart2LeftPadding) + "," + (height - chart2BottomPadding / 2) + ")")
            .style("text-anchor", "middle")
            .text("Selected Candy");
    

        chart2.append("g")
            .attr("transform", "translate(" + chart2LeftPadding + "," + chart2TopPadding + ")")
            .attr("class", "axis")
            .call(d3.svg.axis().scale(y).orient("left"));

        chart2.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 15)
            .attr("x", 0 - height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Rating");

        var tooltip = d3.select("body").append("div")	
            .attr("class", "tooltip card")				
            .style("opacity", 0)
        tooltip.append("span").attr("class", "name");
        tooltip.append("span").attr("class", "joy");
        tooltip.append("span").attr("class", "meh");
        tooltip.append("span").attr("class", "despair");

        chart1.on("click", function() {
            if (this === d3.event.target || selected.length === maxSelected) {
                chart1.selectAll("circle").attr("fill", function(d) {
                    return colorRamp[Math.floor(colorScale(d.value.joy * 2 + d.value.meh))];
                });
                selected = []; // clear array
            } else {
                if (selected.length === 0) {
                    chart1.selectAll("circle").attr("fill", neutralColor);
                }

                var selectedBubble = d3.select(d3.event.target.parentNode);
                var bubbleData = selectedBubble.data()[0];
                if (selected.indexOf(bubbleData) === -1 && selected.length < maxSelected) {
                    selectedBubble.select("circle")
                        .attr("fill", selectedColors[selected.length]);
                    bubbleData.fill = selectedColors[selected.length];
                    selected.push(bubbleData);
                }
            }

            chart2.selectAll("rect").data([]).exit().remove();

            // map ordinal data to x axis
            x.domain(selected.map(function(d) {
                return d.key;
            }));
            
            chart2.selectAll("rect")
                .data(selected).enter()
                .append("rect")
                .attr("x", function(d) {
                    return x(d.key) + chart2LeftPadding;
                })
                .attr("width", x.rangeBand())
                .attr("y", function(d) {
                    return y(2 * d.value.joy + d.value.meh);
                })
                .attr("height", function(d) {
                    return height - chart2BottomPadding - y(2 * d.value.joy + d.value.meh);
                })
                .attr("fill", function(d) {
                    return d.fill;
                })
                .on("mousemove", function(d) {
                    tooltip.style("opacity", 0.9)
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")
                    tooltip.select(".name").text(d.key);
                    tooltip.select(".joy").text("'Joy' votes: " + d.value.joy);
                    tooltip.select(".meh").text("'Meh' votes: " + d.value.meh);
                    tooltip.select(".despair").text("'Despair' votes: " + d.value.despair);
                })
                .on("mouseout", function(d) {
                    tooltip.style("opacity", 0);
                });
        });
    });
}
