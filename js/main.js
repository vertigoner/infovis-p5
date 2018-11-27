/*
* CS4460 P5
* Fall 2018
*
* Sean Gedorio
* Noah Roberts
*/

var width = 500;
var height = 500;
var diameter = 250;

window.onload = start;

function start() {
    var chart1 = d3.select("#bubblechart")
                        .append("svg:svg")
                        .attr("width",width)
                        .attr("height",height);

    var chart2 = d3.select("#details")
                    .append("svg:svg")
                    .attr("width",width)
                    .attr("height",height);

    var chart3 = d3.select("#map")
                    .append("svg:svg")
                    .attr("width",width * 2)
                    .attr("height",height);

    // var bubble = d3.layout.pack()
    //     .size([diameter, diameter])
    //     .padding(3)
    //     .value(function(d) {
    //         return d.size;
    //     })

    d3.csv("./data/candy.csv", function(error, data) {
        if (error) {
            console.error("Error getting or parsing the data.");
            throw error;
        }

        var candyMap = d3.map();

        for (let col of Object.keys(data[0])) {
            if (/^Q6_/.test(col)) {
                candyMap.set(col.substring(3), 0);
            }
        }

        data.forEach(function(d) {
            for (let col of Object.keys(d)) {
                if (/^Q6_/.test(col)) {
                    let key = col.substring(3);
                    let val = candyMap.get(key);

                    if (d[col] === "JOY") {
                        val += 2;
                    } else if (d[col] === "MEH") {
                        val += 1;
                    }

                    candyMap.set(key, val);
                }
            }
        });
        console.log(candyMap);
        
        // chart1.selectAll('circle')
        //     .data(data)
        //     .enter()
        //     .append('circle')
        //     .attr()


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

