var db = $.couch.db(window.location.pathname.split("/")[1]);

var monthtext=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];

//the order of the elements in cryoVal must match the order of the output values in the getData view!
var cryoVal=['T_Bolo', 'P_regul', 'T_Speer', 'T_PT1', 'T_B1K', 'P_B1K',
                'P_injection', 'debit', 'I_Alim1', 'I_Alim2',
                'I_Alim3', 'I_Alim4', 'GM_P', 'PT_P', 'Pt_1',
                'Pt_2', 'Pt_3', 'Hc1', 'Hc2', 'Hc3', 'Hc4'];  
    
$(document).ready(function() {
	//setLastRunOptions(null);
    //setFirstRunOptions(null);
    initialPopulateDropdown(0, "lasthourdropdown", "lastdaydropdown", "lastmonthdropdown", "lastyeardropdown", "cryomeasurement")
    initialPopulateDropdown(4, "firsthourdropdown", "firstdaydropdown", "firstmonthdropdown", "firstyeardropdown", "cryomeasurement")
    getTemperatureFromDbToPlot();
                    
    $('#getTempsId').click(function(e) {

    	//setTableTopRow();
          
        //getTemperatureFromDb();                                  
                
        getTemperatureFromDbToPlot();
                                        
     });

    
});
  /***********************************************
    * Drop Down Date select script- by JavaScriptKit.com
    * This notice MUST stay intact for use
    * Visit JavaScript Kit at http://www.javascriptkit.com/ for this script and more
    ***********************************************/


function initialPopulateDropdown(hourDiff, hourfield, dayfield, monthfield, yearfield, cryo){
        var today=new Date();
        today.setUTCHours(today.getUTCHours() - hourDiff);
        var hourfield=document.getElementById(hourfield);
        var dayfield=document.getElementById(dayfield);
        var monthfield=document.getElementById(monthfield);
        var yearfield=document.getElementById(yearfield);
        var cryofield=document.getElementById(cryo);
        for (var i=0; i<24; i++)
            hourfield.options[i]=new Option(i, i)
        hourfield.options[today.getUTCHours()+1]=new Option(today.getUTCHours()+1, today.getUTCHours()+1, true, true) //select today's day
        
        for (var i=0; i<31; i++)
            dayfield.options[i]=new Option(i+1, i+1)
        dayfield.options[today.getUTCDate()-1]=new Option(today.getUTCDate(), today.getUTCDate(), true, true) //select today's day
        
        for (var m=0; m<12; m++)
            monthfield.options[m]=new Option(monthtext[m], m)
            
        monthfield.options[today.getUTCMonth()]=new Option(monthtext[today.getUTCMonth()], today.getUTCMonth(), true, true) //select today's month
        
        var thisyear=today.getUTCFullYear()
        for (var y=0; y<2; y++){
            yearfield.options[y]=new Option(thisyear, thisyear)
            thisyear-=1
        }
        yearfield.options[0]=new Option(today.getUTCFullYear(), today.getUTCFullYear(), true, true) //select today's year
        
        for (var ii = 0; ii < cryoVal.length; ii++)
            cryofield.options[ii] = new Option(cryoVal[ii], ii);
        cryofield.options[0] = new Option(cryoVal[0], 0, true, true);
        
}
 
    
function getTemperatureFromDbToPlot(){

   var chart;
   var options = { 
      chart: {
         renderTo: 'chart',
         zoomType: 'xy',
         animation: false
         //spacingRight: 20
      },
       title: {
         text: 'Cryogenic Variable vs UTC'
      },
       subtitle: {
          text: 'as reported by Automate server'
      },
      xAxis: {
         type: 'datetime',
         maxZoom: 1000.0* 60.0 * 60.0, // 60 minutes
         title: {
            text: null
         },
         dateTimeLabelFormats: {
            day: '%e %b',
            hour: '%e %b %H:%M'   
         },
         showFirstLabel : false
      },
      yAxis: {
         title: {
            text: null
         },
         //min: 0.6,
         //startOnTick: false,
         showFirstLabel: false,
         labels: {
                    align: 'left',
                    x: 3,
                    y: -2,
                    formatter: function() {
                        return Highcharts.numberFormat(this.value, 5);
                    }
                }
      },
      legend: {
		  align: 'left',
		  verticalAlign: 'top',
		  y: 20,
		  x: 80,
		  floating: true,
		  borderWidth: 0
      },
      tooltip: {
         shared: false,
         enabled: false
      },
      plotOptions: {
         series: {
            /*fillColor: {
               linearGradient: [0, 0, 0, 300],
               stops: [
                  [0, Highcharts.theme.colors[0]],
                  [1, 'rgba(2,0,0,0)']
               ]
            },*/
            lineWidth: 1,
            marker: {
               enabled: false
            },
            shadow: false, 
            animation: false,
            enableMouseTracking: false,
            stickyTracking: false
         }
      },
			
      series: [{
        //type: 'series',
		name: 'Temperature [mK]',
		lineWidth: 1
      }]
    };
        
   	
    var db = $.couch.db(window.location.pathname.split("/")[1]);
    var endyear = parseInt($('#lastyeardropdown').val());
    var endmonth = parseInt($('#lastmonthdropdown').val()) + 1;
    var endday = parseInt($('#lastdaydropdown').val());
    var endhour = parseInt($('#lasthourdropdown').val());
    var startyear = parseInt($('#firstyeardropdown').val());
    var startmonth = parseInt($('#firstmonthdropdown').val()) + 1;
    var startday = parseInt($('#firstdaydropdown').val());
    var starthour = parseInt($('#firsthourdropdown').val());
    var cryoElement = cryoVal[parseInt($('#cryomeasurement').val())]; 
    
    db.view("cryo_2/getData",  {
        endkey:[ cryoElement.valueOf(), endyear, endmonth, endday, endhour, 0, 0],
        startkey:[cryoElement.valueOf(), startyear , startmonth, startday, starthour, 0, 0],
        reduce:false,
        success:function(data){ 
            var temps = [];
            
            jQuery.each(data.rows, function(i, row){
                /*db.openDoc(row["id"],{
                      async: false,
                      success:function(ddoc){
                            
                            var number = ddoc[cryoVal[cryoElement]];  
                            var tnum = new Number(number+'').toFixed(parseInt(5));
                            var t = parseFloat(tnum);
                            var currentdate =  ddoc.utctime; //row.value[0]*1000.0
                            temps.push([currentdate, t]);
                        }
                });*/
                
                var number = row.value;  
                var tnum = new Number(number+'').toFixed(parseInt(10));
                var t = parseFloat(tnum);
                if(cryoElement.valueOf() == 'P_regul')
                   t = t*1000000.0;
                var currentdate =  row.key[6]*1000.0;
                temps.push([currentdate, t]);
				
            });
            
            options.series[0].data = temps;
			options.series[0].name = cryoElement.valueOf();
			chart = new Highcharts.Chart(options);
         },
         error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
         
    });
    
    //do it again, but with the reduce = true and group_level = 1
    db.view("cryo_2/getData",  {
        endkey:[ cryoElement.valueOf(), endyear, endmonth, endday, endhour, 0, 0],
        startkey:[cryoElement.valueOf(), startyear , startmonth, startday, starthour, 0, 0],
        group_level:1,
        success:function(data){ 

            var row = data.rows[0];
            /*var sum = parseFloat( new Number(row.value["sum"]+'').toFixed(parseInt(10)) );
            var count = parseFloat( new Number(row.value["count"]+'').toFixed(parseInt(10)) );
            var min = parseFloat( new Number(row.value["min"]+'').toFixed(parseInt(10)) );
            var max = parseFloat( new Number(row.value["max"]+'').toFixed(parseInt(10)) );
            var sumsqr = parseFloat( new Number(row.value["sumsqr"]+'').toFixed(parseInt(10)) );
            */
            //var sum = row.value.sum;
            //var count = row.value.count
            if (row){
                var mean = row.value.sum / row.value.count;
            var stddev = Math.sqrt(row.value.sumsqr/row.value.count - mean*mean);
            
            addToStats(mean, stddev, row.value.min, row.value.max, row.value.sum, row.value.count, row.value.sumsqr);
            }
            
            
         },
         error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
         
    });
    
}

function addToStats(mean, stddev, min, max, sum, count, sumsqr)
{
    var data=document.getElementById("data");
    while(data.hasChildNodes()){
        data.removeChild(data.childNodes[0])
    }

    var meanL = document.createElement('li');
    meanL.appendChild(document.createTextNode("Mean: " + mean))
    data.appendChild(meanL);
    
    var stddevL = document.createElement('li');
    stddevL.appendChild(document.createTextNode("StdDev: " +stddev))
    data.appendChild(stddevL);
    
    var minL = document.createElement('li');
    minL.appendChild(document.createTextNode("Min: " +min))
    data.appendChild(minL);
    
    var maxL = document.createElement('li');
    maxL.appendChild(document.createTextNode("Max: " +max))
    data.appendChild(maxL);
    
    var sumL = document.createElement('li');
    sumL.appendChild(document.createTextNode("Sum: " +sum))
    data.appendChild(sumL);
    
    var countL = document.createElement('li');
    countL.appendChild(document.createTextNode("Counts: " +count))
    data.appendChild(countL);
    
    var sumsqrL = document.createElement('li');
    sumsqrL.appendChild(document.createTextNode("Sum of Squares:  " +sumsqr))
    data.appendChild(sumsqrL);   
    
    
    //$('ul#data').write(statistics);

}

