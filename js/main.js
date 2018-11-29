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
var colorRamp = ['#edf8fb','#ccece6','#99d8c9','#66c2a4','#2ca25f','#006d2c'];
var neutralColor = "lightgray";
var selectedColor1 = "blue";
var selectedColor2 = "red";

var selected = {
    bubble1: null,
    bubble2: null
}

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
        .range([1, 40]);

    var colorScale = d3.scale.linear()
        .domain([1, 2600])
        .range([0, colorRamp.length])
    
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.5);
    
    var y = d3.scale.linear()
        .domain([1, 2600])
        .range([0, height]);

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

        g.append("svg:text")
            .text(function(d) { return d.key; });

        chart1.on("click", function() {
            if (this === d3.event.target) {
                chart1.selectAll("circle").attr("fill", function(d) {
                    return colorRamp[Math.floor(colorScale(d.value.joy * 2 + d.value.meh))];
                });
                selected.bubble1 = null;
                selected.bubble2 = null;
            } else {
                chart1.selectAll("circle").attr("fill", function(d) {
                    if (selected.bubble1 && d.key === selected.bubble1.data()[0].key) {
                        return selectedColor1;
                    } else {
                        return neutralColor;
                    }
                });
                console.log(selected);
                var selectedBubble = d3.select(d3.event.target.parentNode);
                var color;
                if (!selected.bubble1) {
                    selected.bubble1 = selectedBubble;
                    color = selectedColor1;
                } else {
                    selected.bubble2 = selectedBubble;
                    color = selectedColor2;
                }
                selectedBubble.select("circle").attr("fill", color);
            }
        });

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

        // map ordinal data to x axis
        x.domain(candyMapArray.map(function(d) {
            return d.key;
        }));

        chart2.selectAll(".bar")
            .data(candyMapArray)
            .enter().append("rect")
            .attr("x", function(d) {
                return x(d.key);
            })
            .attr("width", x.rangeBand())
            .attr("y", function(d) {
                return y(d.value.joy)
            })
            .attr("height", function(d) {
                return height - y(d.value.joy);
            })
    });
}
