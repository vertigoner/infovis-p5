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

    var bubble = d3.layout.pack()
        .size([diameter, diameter])
        .padding(3)
        .value(function(d) {
            return d.size;
        })

    d3.csv("./data/candy.csv", function(csv) {

        var nodes = bubble.nodes(csv);
        chart1.selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
            .attr('r', function(d) { return d.r; })
            .attr('class', function(d) { return d.className; });
    });
}

