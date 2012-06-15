var db = $.couch.db(window.location.pathname.split("/")[1]);
var now = new Date();
var fourHoursAgo=new Date();
fourHoursAgo.setUTCHours(fourHoursAgo.getUTCHours() - 4);

$(document).ready(function() {


          $('#idate').datetimepicker({
            numberOfMonths: 1,
            showButtonPanel: true,
            changeMonth: true,
            changeYear: true,
            defaultDate: fourHoursAgo,
            addSliderAccess: true,
            sliderAccessArgs: { touchonly: false },
            onClose: function(dateText, inst) {
                  var endDateTextBox = $('#fdate');
                  if (endDateTextBox.val() != '') {
                      var testStartDate = new Date(dateText);
                      var testEndDate = new Date(endDateTextBox.val());
                      if (testStartDate > testEndDate)
                          endDateTextBox.val(dateText);
                  }
                  else {
                      endDateTextBox.val(dateText);
                  }
              },
              onSelect: function (selectedDateTime){
                  var start = $(this).datetimepicker('getDate');
                  $('#fdate').datetimepicker('option', 'minDate', new Date(start.getTime()));
              }
          });
          $('#fdate').datetimepicker({
            numberOfMonths: 1,
            showButtonPanel: true,
            defaultDate: now,
            changeMonth: true,
            changeYear: true,
            addSliderAccess: true,
            sliderAccessArgs: { touchonly: false },
              onClose: function(dateText, inst) {
                  var startDateTextBox = $('#idate');
                  if (startDateTextBox.val() != '') {
                      var testStartDate = new Date(startDateTextBox.val());
                      var testEndDate = new Date(dateText);
                      if (testStartDate > testEndDate)
                          startDateTextBox.val(dateText);
                  }
                  else {
                      startDateTextBox.val(dateText);
                  }
              },
              onSelect: function (selectedDateTime){
                  var end = $(this).datetimepicker('getDate');
                  $('#idate').datetimepicker('option', 'maxDate', new Date(end.getTime()) );
              }
          });
          
         $('#fdate').datetimepicker('setDate', now );
      $('#idate').datetimepicker('setDate', fourHoursAgo );
    
       
    var cryoSelector =  document.getElementById('icryovars');
                 
     db.view("cryo_2/getData2",  {
         reduce:true,
         group_level:1,
         success:function(data){ 
             var dataPoints = [];

             jQuery.each(data.rows, function(i, row){

                 var cryoVar = row.key[0]; 
                 console.log(cryoVar)
                 var opt = document.createElement("option");
                 opt.text = cryoVar;
                 opt.value= cryoVar;
                 
                 if (cryoVar == 'T_Bolo'){
                   console.log(opt)
                   opt.selected="selected";
                   cryoSelector.add( opt, null);
                   cryoSelector.selectedIndex = cryoSelector.length-1;
                   console.log(cryoSelector.length-1)
                   //cryoSelector.options[ cryoSelector.length] = new Option(cryoVar, cryoVar, true, true);
                 }
                 else {
                   console.log(opt)
                   //cryoSelector.options[ cryoSelector.length] = new Option(cryoVar, cryoVar, false, false);
                   cryoSelector.add( opt, null);
                 }
             });
             
             getTemperatureFromDbToPlot();
          },
          error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}

     });
     
    
     $('#getTempsId').click(function(e) {

     	//setTableTopRow();

         //getTemperatureFromDb();                                  

         getTemperatureFromDbToPlot();

      });
    
     
});

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
        
   	
     var startDate = Date.parse($("#idate").val())/1000.0;
     var endDate = Date.parse($("#fdate").val())/1000.0;
     
    db.view("cryo_2/getData2",  {
        endkey:[ $('#icryovars').val(), endDate],
        startkey:[$('#icryovars').val(), startDate],
        reduce:false,
        success:function(data){ 
            var dataPoints = [];
            
            jQuery.each(data.rows, function(i, row){
                
                var number = row.value;  
                var tnum = new Number(number+'').toFixed(parseInt(10));
                var value = parseFloat(tnum);
                if($('#icryovars').val() == 'P_regul')
                   value = value*1000000.0;
                var currentdate =  row.key[1]*1000.0;
                dataPoints.push([currentdate, value]);

            });
            
            options.series[0].data = dataPoints;
            options.series[0].name = $('#icryovars').val();
            chart = new Highcharts.Chart(options);
         },
         error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
         
    });
    
    //do it again, but with the reduce = true and group_level = 1
    db.view("cryo_2/getData2",  {
        endkey:[ $('#icryovars').val(), endDate],
        startkey:[$('#icryovars').val(), startDate],
        group_level:1,
        success:function(data){ 

            var row = data.rows[0];
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
    
    // var sumL = document.createElement('li');
    //     sumL.appendChild(document.createTextNode("Sum: " +sum))
    //     data.appendChild(sumL);
    //     
    //     var countL = document.createElement('li');
    //     countL.appendChild(document.createTextNode("Counts: " +count))
    //     data.appendChild(countL);
    //     
    //     var sumsqrL = document.createElement('li');
    //     sumsqrL.appendChild(document.createTextNode("Sum of Squares:  " +sumsqr))
    //     data.appendChild(sumsqrL);   
    
    
    //$('ul#data').write(statistics);

}

