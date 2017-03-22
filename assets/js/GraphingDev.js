
    // IIFE to avoid polluting global scope
    (function($) {

        // Locally scoped variables
        var psdCalculations;
        var psdHandsontable;
        var isTableClean = false;
        var chartData;
        var isLogorithmic = true;

        // Click Handlers
        $(document)
            .ready(function($, math) {

                // Initiate Form
                $("#checkboxLogorithmic").attr('checked', isLogorithmic);
                $("#inputA").val(100000000);
                $("#inputB").val(1000);
                $("#inputC").val(1.8);
                $("#inputAP").val(calculateAp());

                $("#inputA").click(function() { enableTableGeneration() });
                $("#inputB").click(function() { enableTableGeneration() });
                $("#inputC").click(function() { enableTableGeneration() });

                $("#inputA").on('input', function() { $("#inputAP").val(calculateAp()); });
                $("#inputB").on('input', function() { $("#inputAP").val(calculateAp()); });
                $("#inputC").on('input', function() { $("#inputAP").val(calculateAp()); });

                $("#checkboxLogorithmic")
                    .click(function() {
                        isLogorithmic = $(this).is(':checked');
                        loadGraph();
                    });

                $("#btnGraph")
                    .click(function() {
                        if (!isTableClean)
                            generateTable();
                        loadGraph();
                    });

                $("#GenerateTableValues")
                    .click(function() {
                        generateTable();
                    });
            });

        // Set table to dirty and enable the refresh button
        function enableTableGeneration() {
            isTableClean = false;
            $('#GenerateTableValues').prop('disabled', false);
        }

        // Set table to clean and disable the refresh button
        function disableTableGeneration() {
            isTableClean = true;
            $('#GenerateTableValues').prop('disabled', true);
        }

        // Generate the table (called when "Calculate PSD Values" button is clicked
        function generateTable() {

            // Only render once
            if (isTableClean) {
                disableTableGeneration();
                return;
            }

            psdCalculations = getGridData();

            // Remove previous table if needed
            if (psdHandsontable) {
                psdHandsontable.destroy();
            }

            var container = document.getElementById('exampleTable');
            psdHandsontable = new window.Handsontable(container,
            {
                data: psdCalculations,
                rowHeaders: true,
                // colHeaders: true 
                colHeaders: [
                    'Step', 'freq (1/micron)', 'PSD2 (nm^4)', 'RMS DENSITY', 'RMS^2', 'RMSB^2'
                ],
                columns: [
                    { data: 'step' },
                    { data: 'freq' },
                    //{ data: 'hidden', readOnly: true }, // Calculation column
                    { data: 'psd2' },
                    { data: 'rmsDensity' },
                    { data: 'rms2' },
                    { data: 'rmsb2' }
                ]
            });
            disableTableGeneration();
        }

        function loadGraph() {

            //var freqCol = {
            //    name: 'Frequency',
            //    data: getPropertyVsFrequency("freq"),
            //    visible: false
            //};

            // TODO: set exponent symbol here - http://stackoverflow.com/questions/28970913/adding-html-label-to-highcharts
            //  Replace "^2" with "&sup2;"
            var psd2Col = {
                name: 'PSD^2',
                data: getPropertyVsFrequency("psd2")
            };

            var rmsDensityCol = {
                name: 'RMS Density',
                data: getPropertyVsFrequency("rmsDensity"),
                visible: false
            };

            // TODO: Update to exponent symbol here too
            var rms2Col = {
                name: 'RMS^2',
                data: getPropertyVsFrequency("rms2")
            };

            var rmsb2Col = {
                name: "RMSB^2",
                data: getPropertyVsFrequency("rmsb2")
            };

            var allChartColumns = [psd2Col, rms2Col, rmsb2Col, rmsDensityCol];


            window.Highcharts.chart('graphDiv',
            {
                title: {
                    text: 'PSD Equation'
                },

                subtitle: {
                    text: 'Source: John Schweyen'
                },

                xAxis: {
                    title: {
                        text: 'SPATIAL FREQUENCY (1/micron)'
                        //  data: psdHandsontable.getDataAtProp("freq")
                    }
                },

                yAxis: {
                    title: {
                        text: 'PSD (nm^4)'
                    },
                    type: isLogorithmic ? 'logarithmic' : '',
                },

                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },

                series: allChartColumns
            });
        }

        function getPropertyVsFrequency(propertyName) {
            var freq = psdHandsontable.getDataAtProp("freq");
            var target = psdHandsontable.getDataAtProp(propertyName);
            return (combineArraysToTwoDimensionalArray(target, freq));

        }

        function combineArraysToTwoDimensionalArray(array1, array2) {
            //var result; 
            //for (var i = 0; i < array1.length; i++) {
            //    result.push([array1[i], array2[i]]);
            //}
            //return result;

            // Backwards compatable
            return array1;

            // TODO: Resume here making this array1 vs. frequency (array2)

            // resume here plotting each series against frequency 
            var result = array1.map(function (v, i) {
                return [v, array2[i]];
            });
            return result;

        }

        function calculateAp() {
            var a = parseFloat($("#inputA").val());
            var b = parseFloat($("#inputB").val());
            var c = parseFloat($("#inputC").val());

            var gammalnparam1 = .5 * (c + 1);
            var gammalnparam2 = .5 * c;

            var apDividend = a * b * math.exp(gammaln(gammalnparam1));
            var apDivisor = 2 * math.sqrt(Math.PI) * math.exp(gammaln(gammalnparam2));

            var ap = apDividend / apDivisor;

            return ap;
        }

        function gammaln(param) {
            var x = math.gamma(param);
            return math.log(x);
        }

        function getGridData() {
            //return chartData;

            var a = parseFloat($("#inputA").val());
            var b = parseFloat($("#inputB").val());
            var c = parseFloat($("#inputC").val());
            var ap = parseFloat($("#inputAP").val());

            var steps = [
                { step: -4 }, { step: -3.9 }, { step: -3.8 }, { step: -3.7 }, { step: -3.6 }, { step: -3.5 },
                { step: -3.4 }, { step: -3.3 }, { step: -3.2 }, { step: -3.1 }, { step: -3 }, { step: -2.9 },
                { step: -2.8 }, { step: -2.7 }, { step: -2.6 }, { step: -2.5 }, { step: -2.4 }, { step: -2.3 },
                { step: -2.2 }, { step: -2.1 }, { step: -2 }, { step: -1.9 }, { step: -1.8 }, { step: -1.7 },
                { step: -1.6 }, { step: -1.5 }, { step: -1.4 }, { step: -1.3 }, { step: -1.2 }, { step: -1.1 },
                { step: -1 }, { step: -0.9 }, { step: -0.8 }, { step: -0.75 }, { step: -0.7 }, { step: -0.65 },
                { step: -0.6 }, { step: -0.55 }, { step: -0.5 }, { step: -0.45 }, { step: -0.4 }, { step: -0.35 },
                { step: -0.3 }, { step: -0.25 }, { step: -0.2 }, { step: -0.15 }, { step: -0.14 }, { step: -0.13 },
                { step: -0.12 }, { step: -0.11 }, { step: -0.1 }, { step: -0.09 }, { step: -0.08 }, { step: -0.07 },
                { step: -0.06 }, { step: -0.05 }, { step: -0.04 }, { step: -0.03 }, { step: -0.02 }, { step: -0.01 },
                { step: -0.008 }, { step: -0.006 }, { step: -0.004 }, { step: -0.002 }, { step: -0.0015 },
                { step: -0.001 }, { step: -0.0005 }
            ];

            chartData = [];

            for (var i in steps) {
                if (steps.hasOwnProperty(i)) {
                    var step = steps[i].step;
                    var freq = Math.pow(10, step);
                    var hidden = Math.sqrt(1 + Math.pow((b * freq), 2));
                    var psd2 = 0.5 * ap / Math.pow(hidden, (c + 1));
                    var rmsDensity, rms2, rmsb2;

                    if (i == 0) {
                        rmsDensity = '';
                        rms2 = '';
                        rmsb2 = '';
                    } else {
                        var previousStep = chartData[i - 1];

                        var rmsDensityList = chartData
                            .map(function(a) { return a.rmsDensity; }); // get array of rms density values so far
                        var rms2List = chartData
                            .map(function(a) { return a.rms2; }); // get array of rms^2 values so far

                        rmsDensity = 2 *
                            Math.PI *
                            (freq + previousStep.freq) *
                            (psd2 + previousStep.psd2) *
                            (freq - previousStep.freq) /
                            4 /
                            1000000;

                        rmsDensityList
                            .push(rmsDensity); // Add current value for rmsDensity to list before calculating sum
                        rms2 = rmsDensityList.reduce(add, 0); // take the sum of all rms densities so far

                        rms2List.push(rms2); // Add current value for rms2 to sum before calculating rmsb2 values
                        rmsb2 = rms2List.reduce(add, 0); // take the sum of all rms2 so far
                    }

                    var row = {
                        step: step,
                        freq: freq,
                        hidden: hidden,
                        psd2: psd2,
                        rmsDensity: rmsDensity,
                        rms2: rms2,
                        rmsb2: rmsb2
                    };

                    chartData.push(row);
                }
            }

            // Use with reduce to quickly sum over an array - StackOverflow #1230233
            function add(a, b) {
                if (typeof (a) === "number" && typeof(b) === "number")
                    return a + b;
                else {
                    var x = parseFloat(a);
                    var y = parseFloat(b);
                    x = a || 0; // Handle NaN
                    y = a || 0;
                    return add(x, y);
                }
            }

            return chartData;
        }


    })(jQuery, math); // End of IIFE scope. Pass jQuery reference into IIFE as '$'

    // Global Functions
    function validateNumeric(e) {
        var theEvent = e || window.event;
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]|\./;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }