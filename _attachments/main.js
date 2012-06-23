var db = $.couch.db(window.location.pathname.split("/")[1]);
var hardwareMapDb = $.couch.db('muonvetohardwaremap');

var now = new Date();
var fourDaysAgo = new Date();
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
var highVoltageDoc = {};
var hardwareMapDoc = {};

$(document).ready(function() {


  $('#idate').datetimepicker({
    numberOfMonths: 1,
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    defaultDate: fourDaysAgo,
    addSliderAccess: true,
    sliderAccessArgs: { touchonly: false },
    onClose: function(dateText, inst) {
      var endDateTextBox = $('#fdate');
      if (endDateTextBox.val() != '') {
        var testStartDate = new Date(dateText);
        var testEndDate = new Date(endDateTextBox.val());
        if (testStartDate > testEndDate) endDateTextBox.val(dateText);
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
        if (testStartDate > testEndDate)    startDateTextBox.val(dateText);
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
  $('#idate').datetimepicker('setDate', fourDaysAgo );
    
  $('.btn').button();
 
  $("#latestvalues_table").tablesorter( );
  
  $('.previousbtn').click( function(e) {
   if( $('.previousbtn').hasClass('disabled') == false)
      getPreviousData();
  });
    
  $('.nextbtn').click( function(e) {
   if( $('.nextbtn').hasClass('disabled') == false)
      getNextData();
  }); 
   
  $('.latestbtn').click( function(e) {
    if( $('.latestbtn').hasClass('disabled') == false)
      getLatestData();
  });
      
  $('#plotButton').click(function(e) {
    PlotData();
  });
    
  hardwareMapDb.view('map/hv', {
    reduce:false,
    descending:true,
    async:false,
    success:function(data){
      jQuery.each(data.rows, function(i, row){
          //if (hardwareMapDoc.hasKey(data.rows[i]["key"][0] + data.rows[i]["key"][1]) == false)
          //hardwareMapDoc[ data.rows[i]["key"][0] + data.rows[i]["key"][1] ] = {};
          //not using the date of the hardwaremap configuration. this is okay for now
          //since there is only one valid date and the hardware map hasn't changed since then
          //but this should be supported in the future in the case that the map changes...  
          hardwareMapDoc[ data.rows[i]["key"][0] + " " + data.rows[i]["key"][1] ] = data.rows[i].value;
          console.log(hardwareMapDoc)
      });
      getLatestData(); 
    }
  });
  
  
    
});

function getLatestData()
{
  db.view('app/logbydate', {
    reduce:false,
    limit:1,
    descending:true,
    include_docs:true,
    success:function(data){
      highVoltageDoc = data.rows[0]["doc"];
      fillHighVoltageTable(highVoltageDoc);
    }
  });
}

function getPreviousData()
{
  db.view('app/logbydate', {
    reduce:false,
    limit:1,
    descending:true,
    include_docs:true,
    success:function(data){
      highVoltageDoc = data.rows[0]["doc"];
      fillHighVoltageTable(highVoltageDoc);
    }
  });
}
function getNextData()
{
  db.view('app/logbydate', {
    reduce:false,
    limit:1,
    descending:true,
    include_docs:true,
    success:function(data){
      highVoltageDoc = data.rows[0]["doc"];
      fillHighVoltageTable(highVoltageDoc);
    }
  });
}

function fillHighVoltageTable(doc)
{
     $('.overview_table_body_elements').remove();
     var docDate = new Date(doc['date_valid']['unixtime']*1000.0);
     document.getElementById("latestvalues_date").innerHTML = docDate.toUTCString();
     
     for (key in hardwareMapDoc) {
       var row = '<tr class="overview_table_body_elements">'
       row += '<td>'+key+'</td>';
       row += '<td>'+hardwareMapDoc[key]+'</td>';
       row += '<td>'+ doc['values'][hardwareMapDoc[key]]['actual']+'</td>';    
       row += '<td>'+ doc['values'][hardwareMapDoc[key]]['demand']+'</td>';
       var diffClass = "";
       if (Math.abs(doc['values'][hardwareMapDoc[key]]['actual'] - doc['values'][hardwareMapDoc[key]]['demand']) > 10){
         diffClass = 'class="red-table-element"';
       } 
       else {
         diffClass = 'class="green-table-element"';
       } 
       var diffValue = doc['values'][hardwareMapDoc[key]]['actual'] - doc['values'][hardwareMapDoc[key]]['demand'];
       
       row += '<td '+diffClass+' >'+ diffValue +'</td>';  
       row += '<td>'+ doc['values'][hardwareMapDoc[key]]['saved']+'</td>';  
       row += '<td>'+ doc['values'][hardwareMapDoc[key]]['backup']+'</td>';    
       $('#latestvalues_table').append(row);
     }
     $('.red-table-element').css("color","#f11");
     $('.green-table-element').css("color","rgb(15,99,30)");
     
     
     $("#latestvalues_table").trigger("update");
}

function getOptions(){
  
  var options = { 
      chart: {
         renderTo: 'chart',
         zoomType: 'xy',
         animation: false
         //spacingRight: 20
      },
       title: {
         text: 'Muon Veto HV Actual Values'
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
    };
    
    return options;
}

function PlotData(){

  var chart; 
  options = getOptions('');
  
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
    
    
    
}

