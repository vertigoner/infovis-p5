/*
* CS4460 P5
* Fall 2018
*
* Sean Gedorio
* Noah Roberts
*/

var width = 700;
var height = 700;
var diameter = 250;
var colorRamp = ["db4242", "b76a40", "93923e", "6eba3c", "4ae23a"];

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

    d3.csv("./data/candy.csv", function(error, data) {
        if (error) {
            console.error("Error getting or parsing the data.");
            throw error;
        }

        var candyMap = d3.map();

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

        let candyMapArray = candyMap.entries();

        force = d3.layout.force() //set up force
            .size([width, height])
            .nodes(candyMapArray)
            .charge(-200)
            .start();

        var drag = force.drag();

        var radiusScale = d3.scale.linear()
            .domain([1, 2600])
            .range([1, 40]);

        chart1.selectAll("circle")
             .data(candyMapArray)
             .enter().append("circle")
             .call(drag)
             .attr("class", "candy")
             .attr("r", function(d) {
                return radiusScale(d.value.joy * 2 + d.value.meh);
             })
             .attr("fill", function(d) {
                return "red";
             })
             .append("text").text(function(d) { return "TEST"; });

        force.on("tick", tick);

        function tick() {
        chart1.selectAll("circle")
            .attr("cx", function(d) {
                return d.x;
            }) 
             .attr("cy", function(d) {
                return d.y;
            });        
        }

        // var scaleRadius = d3.scaleLinear()
        //     .domain([d3.min(data, function(d) { return +d.views; }), 
        //             d3.max(data, function(d) { return +d.views; })])
        //     .range([5,18]);

        // var bubbleChart = bubbleChart();
        // chart1.data(data).call(bubbleChart);
    });

}

// function bubbleChart() {
//     function chart(selecttion) {

//     }
//     return chart;
// }

