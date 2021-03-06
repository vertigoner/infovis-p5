/*
* CS4460 P5
* Fall 2018
*
* Sean Gedorio
* Noah Roberts
*/

const width = 700;
const height = 700;
const diameter = 250;
const colorRamp = ['#5D2B7D','#A72D89','#1474BB','#8FC33E','#FEEE22','#E41E26'];
const neutralColor = "lightgray";
const selectedColors = ["#003f5c", "#58508d", "#bc5090", "#ff6361", "#ffa600"];
const filterColor = "#58508d";
const histColor = filterColor;
const maxSelected = 5;
const chart2BottomPadding = 50;
const chart2LeftPadding = 100;
const chart2TopPadding = 50;

var mode = "";
var selected = [];
var filterSelected; //initialize as Butterfinger

function CandyEntry(joy, meh, despair) {
    this.joy = joy;
    this.meh = meh;
    this.despair = despair;
}

function maleEntry(joy, meh, despair) {
    this.joy = joy;
    this.meh = meh;
    this.despair = despair;
}

function femaleEntry(joy, meh, despair) {
    this.joy = joy;
    this.meh = meh;
    this.despair = despair;
}

function otherEntry(joy, meh, despair) {
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

    var chart3_gender = d3.select("#filter")
                    .append("svg:svg")
                    .attr("id", "chart3Gender")
                    .attr("width", width)
                    .attr("height", height / 2);

    var chart3_age = d3.select("#filter")
                    .append("svg:svg")
                    .attr("id", "chart3Age")
                    .attr("width", width)
                    .attr("height", height / 2);


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

    var xHist = d3.scale.linear()
        .domain([0, 100])
        .range([0, width - chart2LeftPadding - 10]);

    var yHist = d3.scale.linear()
        .range([height / 2 - chart2BottomPadding - 5, 0])
        .domain([0, 215]);

    var filterButton = d3.select("#buttonWrapper")
        .append('button')
        .text('Demographics')
        .attr('class', 'button card')
        .on('click', function() {
            d3.select("#filter")
                .style("visibility", "visible");
            d3.select("#details")
                .style("visibility", "hidden");
            
            chart1.selectAll("circle").attr("fill", function(d) {
                return colorRamp[Math.floor(colorScale(d.value.joy * 2 + d.value.meh))];
            });
            filterSelected = new CandyEntry(0,0,0);
            selected = [];
            chart3_gender.selectAll("g")
                .data([])
                .exit().remove();
            chart3_age.selectAll(".bar")
                .data([])
                .exit().remove();
            mode = "filter";

            chart3_gender.append("text")
                .attr("class", "welcomeText")
                .text("Please select a candy")
                .attr("x", "50%")
                .attr("y", "50%")
                .style("font-size", "14px")
        });

    var compareButton = d3.select("#buttonWrapper") 
        .append('button')
        .text('Compare')
        .attr('class', 'button card')
        .on('click', function() {
            d3.select("#details")
                .style("visibility", "visible");
            d3.select("#filter")
                .style("visibility", "hidden");
            chart1.selectAll("circle").attr("fill", function(d) {
                return colorRamp[Math.floor(colorScale(d.value.joy * 2 + d.value.meh))];
            });
            selected = []; // clear array
            filterSelected = new CandyEntry(0,0,0);
            chart2.selectAll("rect").data([]).exit().remove();
            mode = "compare";
        });

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
                    } else if (d[col] === "")
                    candyMap.set(key, candyEntry);
                }
            }
        });

        //create chart1 

        let candyMapArray = candyMap.entries();
        candyMapArray.shift();

        force = d3.layout.force() //set up force
            .size([width, height])
            .nodes(candyMapArray)
            .charge(-200)
            .start();

        var drag = force.drag();

        var radiusScale = d3.scale.linear()
            .domain([1, 2600])
            .range([1, 40]);

        var colorScale = d3.scale.linear()
            .domain([1, 2600])
            .range([0, colorRamp.length])

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

        // create chart3

        chart3_age.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + chart2LeftPadding + "," + (height / 2 - chart2BottomPadding) + ")")
            .call(d3.svg.axis().scale(xHist).orient("bottom"));

        chart3_age.append("text")             
            .attr("transform", "translate(" + (width / 2 + 30) + "," + (height / 2 - 10) + ")")
            .style("text-anchor", "middle")
            .text("Age Distribution for Selected Candy");

        chart3_age.append("g")
            .attr("transform", "translate(" + chart2LeftPadding + "," + 5 + ")")
            .attr("class", "axis")
            .call(d3.svg.axis().scale(yHist).orient("left"));

        chart3_age.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 50)
            .attr("x", 0 - height / 4)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of \"Joy\" Votes");

        chart1.on("click", function() {
            if (this === d3.event.target || selected.length === maxSelected || mode === "") {
                chart1.selectAll("circle").attr("fill", function(d) {
                    return colorRamp[Math.floor(colorScale(d.value.joy * 2 + d.value.meh))];
                });
                selected = []; // clear array
                chart2.selectAll("rect").data([]).exit().remove();
                filterSelected = new CandyEntry(0,0,0);
                chart3_gender.selectAll("g")
                    .data([])
                    .exit().remove();
                chart3_age.selectAll(".bar")
                    .data([])
                    .exit().remove();
            } else {
                if (selected.length === 0) {
                    chart1.selectAll("circle").attr("fill", neutralColor);
                }

                var selectedBubble = d3.select(d3.event.target.parentNode);
                var bubbleData = selectedBubble.data()[0];

                if (mode === "filter") {
                    selectedBubble.select("circle")
                        .attr("fill", filterColor);
                        filterSelected = bubbleData;
                } else if (selected.indexOf(bubbleData) === -1 && selected.length < maxSelected) {
                    selectedBubble.select("circle")
                        .attr("fill", selectedColors[selected.length]);
                    bubbleData.fill = selectedColors[selected.length];
                    selected.push(bubbleData);
                    filterSelected = bubbleData;
                }
            }

            chart3_gender.select(".welcomeText").remove();

            //FILTER GENDER
            if (filterSelected && filterSelected.key) {
            var male = new maleEntry(0, 0, 0);
            var female = new femaleEntry(0, 0, 0);
            var other = new otherEntry(0, 0, 0);

            var personMap = d3.nest()
            .key(function(d) { return d.Q2_GENDER; })
            .key(function(d) { 
                return d["Q6_" + filterSelected.key] })
            .entries(data);

            for (i = 0; i < personMap.length; i++) {
                if (personMap[i].key === 'Male') {
                    for (j = 0; j < ((d3.values(personMap[i]))[1]).length; j++) {
                        var tempArray = ((d3.values(personMap[i]))[1])[j];
                        var scoreType = d3.values(tempArray)[0];
                        if (scoreType === "JOY") {
                            male.joy = d3.values(tempArray)[1].length;
                        }

                        if (scoreType === "MEH") {
                            male.meh = d3.values(tempArray)[1].length;
                        }

                        if (scoreType === "DESPAIR") {
                            male.despair = d3.values(tempArray)[1].length;
                        }
                    }
                } else if (personMap[i].key === 'Female') {
                    for (j = 0; j < ((d3.values(personMap[i]))[1]).length; j++) {
                        var tempArray = ((d3.values(personMap[i]))[1])[j];
                        var scoreType = d3.values(tempArray)[0];
                        if (scoreType === "JOY") {
                            female.joy = d3.values(tempArray)[1].length;
                        }

                        if (scoreType === "MEH") {
                            female.meh = d3.values(tempArray)[1].length;
                        }

                        if (scoreType === "DESPAIR") {
                            female.despair = d3.values(tempArray)[1].length;
                        }
                    }
                } else {
                    for (j = 0; j < ((d3.values(personMap[i]))[1]).length; j++) {
                        var tempArray = ((d3.values(personMap[i]))[1])[j];
                        var scoreType = d3.values(tempArray)[0];
                        if (scoreType === "JOY") {
                            other.joy += d3.values(tempArray)[1].length;
                        }

                        if (scoreType === "MEH") {
                            other.meh += d3.values(tempArray)[1].length;
                        }

                        if (scoreType === "DESPAIR") {
                            other.despair += d3.values(tempArray)[1].length;
                        }
                    }
                }
            }

            var genderMap = d3.map();
            genderMap.set('Male', male);
            genderMap.set('Female', female);
            genderMap.set('Other', other);

            var genderMapArray = genderMap.entries();

            force2 = d3.layout.force() //set up force
            .size([width, height/2])
            .nodes(genderMapArray)
            .charge(-1000)
            .start();

            force2.on("tick", tick2);

            var drag2 = force2.drag();

            var genderRadiusScale = d3.scale.linear()
            .domain([0, 2])
            .range([1, 90]);

            chart3_gender.selectAll("g")
            .data([])
            .exit().remove();

            var g1 = chart3_gender.selectAll("g")
            .data(genderMapArray)
            .enter().append("g")
            .call(drag2);

            g1.append("circle")
            .attr("class", "genders")
            .attr("r", function(d) {
                var normalizedData = (d.value.joy * 2 + d.value.meh) / (d.value.joy +
                    d.value.meh + d.value.despair);
                return genderRadiusScale(normalizedData);
            })
            .attr("fill", function(d) {
                if (d.key === "Male") {
                    return "#e96fdf";
                } else if (d.key == "Female") {
                    return "#6f86e9";
                } else {
                    return "#9ee393";
                }
            });
            g1.on("mousemove", function(d) {
                tooltip.style("opacity", 0.9)
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
                tooltip.select(".name").text(filterSelected.key + ": " + d.key + " votes");
                tooltip.select(".joy").text("\"Joy\" votes: " + d.value.joy);
                tooltip.select(".meh").text("\"Meh\" votes: " + d.value.meh);
                tooltip.select(".despair").text("\"Despair\" votes: " + d.value.despair);
            })
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0);
            });

            g1.append("svg:text")
                .text(function(d) { return d.key; })
                .attr("class", "bubbleText");

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
                    tooltip.select(".joy").text("\"Joy\" votes: " + d.value.joy);
                    tooltip.select(".meh").text("\"Meh\" votes: " + d.value.meh);
                    tooltip.select(".despair").text("\"Despair\" votes: " + d.value.despair);
                })
                .on("mouseout", function(d) {
                    tooltip.style("opacity", 0);
                });


            var ageArray = [];
            data.forEach(function(d) {
                if (d["Q6_" + filterSelected.key] === "JOY") {
                    ageArray.push(d.Q3_AGE);
                }
            });

            var bins = d3.layout.histogram()
                .bins(xHist.ticks(30))
                (ageArray);

            chart3_age.selectAll(".bar").data([]).exit().remove();
                
            var histBar = chart3_age.selectAll(".bar")
                .data(bins)
                .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function(d) {
                    return "translate(" + (xHist(d.x) + chart2LeftPadding + 1) + "," + (yHist(d.y)) + ")";
                });

            histBar.append("rect")
                .attr("x", 1)
                .attr("width", 28)
                .attr("height", function(d) {
                    return height / 2 - chart2BottomPadding - yHist(d.y);
                })
                .attr("fill", histColor);
        }
    });

        function tick2() {
            chart3_gender.selectAll("circle")
                .attr("cx", function(d) {
                    return d.x;
                }) 
                .attr("cy", function(d) {
                    return d.y;
                });
            chart3_gender.selectAll(".bubbleText")
                .attr("x", function(d) {
                    return d.x;
                }) 
                .attr("y", function(d) {
                    return d.y;
                });
        }

        // create chart2

        // map ordinal data to x axis
        /*x.domain(candyMapArray.map(function(d) {
            return d.key;
        }));*/
        //console.log(candyMapArray);
        //console.log(selected.entries());

        //create gender filter
    });
}
