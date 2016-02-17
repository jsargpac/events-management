var app = angular.module('fup');

/*
 * Directive to make a OHLC candlestick + volume chart
 * Object stock built according to :
 * xaxis : array of [2010, 2011, 2013]
 * dataseries : [
 * 		{
 * 			type : 'column' or 'line' or 'spline'
 * 			name : name of the serie
 * 			data : [1, 3, 6]
 * 			yaxis : 1 if on the right side, nothing else
 * 			suffix
 * 		}
 * ]
 */
app.directive('hcLine', function ($timeout) {
	return {
		restrict: 'C',
		replace: true,
		scope: {
			dataseries: '='
		},
		template: '<div>not working</div>',
		transclude: true,
		link: function (scope, element, attrs) {
			var chart = new Highcharts.Chart({
				chart: {
					renderTo: attrs.id,
					type: attrs.charttype,
					height: attrs.chartheight,
					width: attrs.chartwidth,
					backgroundColor: null,
					animation: true,
					events: {
						load: function(chart) {
							$timeout(function() {
								chart.target.reflow();   
							});
						}
					}
				},

				exporting: { enabled: false },

				tooltip: {
					shared: true,
					valueDecimals: 2
				},

				title: {
					text: null
				},
				series: []
			});

			scope.$watch("dataseries", function (newValue) {
				if (newValue != undefined) {
					while( chart.series.length > 0 ) {
						chart.series[0].remove( false );
					}
					angular.forEach(newValue, function(value,key) {
						chart.addSeries(value,true);
					});
				}
			}, true);

		}
	}
});