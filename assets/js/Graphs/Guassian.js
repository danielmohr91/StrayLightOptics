src="assets/js/Graphs/Guassian.js"

    var toolTipElement = document.getElementById("toolTip");
    toolTipElement.style.position ="absolute";

    function showToolTip(value,positionX,positionY){

        toolTipElement.style.top =positionY + 10 + "px";
        toolTipElement.style.left =positionX + 10 +"px";
        toolTipElement.innerHTML = " Z = " + value;

    }
    function hideToolTip(){
        toolTipElement.innerHTML = " ";

    }

    function drawGaussianCurve() {

        var calculationService = (function (){
            var distanceFromMean = 5;

            function getRightBound(middle,step){
                return middle + step *5;
            }
            function getLeftBound(middle,step){
                return middle - (step*distanceFromMean)
            }
            function sort(values){
                return values.sort(function (a,b){return a-b;});
            }
            function getVariance (values,mean){
                var temp = 0;
                var numberOfValues = values.length;
                while( numberOfValues--){
                    temp += Math.pow( (values[numberOfValues ] - mean), 2 );
                }
                return temp / values.length;
            }

            function getSum(values){
                return values.reduce(function(previousValue, currentValue) {
                    return previousValue + currentValue;
                });
            }

            function getGaussianFunctionPoints(std,mean,variance,leftBound,rightBound){
                var data = [];
                for (var i = leftBound; i <= rightBound;i++) {
                    data.push({x:i,y:(1/(std*Math.sqrt(Math.PI*2)))*Math.exp(-(Math.pow(i-mean,2)/ (2*variance)))});
                }
                console.log(data);
                return  data;
            }

            function getMean (valueSum,numberOfOccurrences){
                return valueSum / numberOfOccurrences
            }

            function getZ(x,mean,standardDerivation){

                return (x-mean)/standardDerivation;
            }

            function getWeightedValues(values){
                var weightedValues= {};
                var data= [];
                var lengthValues = values.length;
                for (var i = 0; i < lengthValues; i++) {
                    var label = values[i].toString();

                    if(weightedValues[label]){
                        weightedValues[label].weight++;
                    }else{
                        weightedValues[label]={weight :1,value :label};
                        data.push(weightedValues[label]);
                    }
                }

                return data;


            }
            function getRandomNumber(min,max) {
                return (Math.round((max-min) * Math.random() + min));
            }

            function getRandomValueArray (numberOfValues,min,max){
                var values = [];
                for (var i = 0; i < numberOfValues; i++) {
                    values.push(getRandomNumber(min,max));
                }
                return values
            }
            return {
                getRandomValueArray: getRandomValueArray,
                getGaussianFunctionPoints: getGaussianFunctionPoints,
                getWeightedValues: getWeightedValues,
                getSum: getSum,
                getMean: getMean,
                sort: sort,
                getVariance: getVariance,
                getLeftBound: getLeftBound,
                getZ: getZ,
                getRightBound: getRightBound

            };

        })();



        var seriesName = "RANDOM VARIABLE";
        var sample = calculationService.sort(calculationService.getRandomValueArray(200,-100,100));
        var sum = calculationService.getSum(sample);
        var min = sample[0];
        var max = sample[sample.length - 1];
        var mean = calculationService.getMean(sum, sample.length);
        var variance = calculationService.getVariance(sample, mean);
        var standardDerivation =  Math.sqrt(variance);
        var rightBound = calculationService.getRightBound(mean, standardDerivation);
        var leftBound = calculationService.getLeftBound(mean,standardDerivation);
        var bottomBound = 0;
        var topBound = 1/(standardDerivation*Math.sqrt(Math.PI*2));
        var gaussianCurveData = calculationService.getGaussianFunctionPoints(standardDerivation,mean,variance,leftBound,rightBound);


        var gaussianWidget = {
            width: 1000,
            height: 500,
            margins: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            },
            curve :{
                color : "red",
                fill : "aquamarine",
                stroke : 2,
                opacity : 0.25

            },
            circles :{
                radiusCoef : 5,
                fill : "red",
                opacity : 0.5
            }

        };



        document.write("<br/>");
        document.write("<br/>");
        document.write("<br/>");
        document.write("<div style='color: white;width:500px;word-wrap: break-word'>");
        document.write("| min | "+ min.toLocaleString() );
        document.write("<br/>");
        document.write("| max | "+ max.toLocaleString() );
        document.write("<br/>");
        document.write("| mean | "+ mean.toLocaleString() );
        document.write("<br/>");
        document.write("| variance | "+ variance.toLocaleString() );
        document.write("<br/>");
        document.write("| standard derivation | "+ standardDerivation.toLocaleString());
        document.write("<br/>");
        document.write("<br/>");
        document.write("| var (x) | "+ sample);
        document.write("</div>");





        var vis = d3.select("#gaussianContainerCruve"),
                width = gaussianWidget.width,
                height = gaussianWidget.height,
                margins = {
                    top: gaussianWidget.margins.top,
                    right: gaussianWidget.margins.right,
                    bottom: gaussianWidget.margins.bottom,
                    left: gaussianWidget.margins.left
                },

                xScale = d3.scale.linear().range([margins.left, width-margins.right ]).domain([leftBound, rightBound]),
                yScale = d3.scale.linear().range([height - margins.top, margins.bottom]).domain([bottomBound, topBound]),


                xAxis = d3.svg.axis().ticks(20)
                        .scale(xScale),

                yAxis = d3.svg.axis()
                        .scale(yScale)
                        .ticks(10)
                        .tickPadding(0)
                        .orient("right");



        var lineGen = d3.svg.line()
                .x(function(d) {
                    return xScale(d.x);
                })
                .y(function(d) {
                    return yScale(d.y);
                })

                .interpolate("basis");

        vis.append('svg:path')
                .attr('d', lineGen(gaussianCurveData))
                .data([gaussianCurveData])
                .attr('stroke', gaussianWidget.curve.color)
                .attr('stroke-width', gaussianWidget.curve.stroke)
                .on('mousemove', function(d){
                    showToolTip(calculationService.getZ(xScale.invert(d3.event.x),mean,standardDerivation).toLocaleString(),d3.event.x,d3.event.y);

                })
                .on('mouseout', function(d){
                    hideToolTip();
                })
                .attr('fill', gaussianWidget.curve.fill)
                .style("opacity",gaussianWidget.curve.opacity);


        vis.append("svg:g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (height - margins.bottom) + ")")
                .call(xAxis);

        vis.append("svg:g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (xScale(mean)-7) + ",0)")
                .call(yAxis);




        vis.append("svg:g")
                .append("text")      // text label for the x axis
                .attr("x", width/2 + width/4  )
                .attr("y", 20  )

                .style("text-anchor", "middle")
                .style("fill", "white")
                .text(seriesName);

        vis.selectAll("circle")
                .data(calculationService.getWeightedValues(sample)).enter().append("circle")
                // text label for the x axis
                .attr("cx", function (d) { return xScale(d.value)})
                .attr("cy", height - margins.bottom)
                .attr("r", function (d) { return d.weight*gaussianWidget.circles.radiusCoef; })
                .style("fill",gaussianWidget.circles.fill)
                .style("opacity",gaussianWidget.circles.opacity);










    }

    drawGaussianCurve();
