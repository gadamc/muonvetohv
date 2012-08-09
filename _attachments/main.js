var db = $.couch.db(window.location.pathname.split("/")[1]);
var hardwareMapDb = $.couch.db('muonvetohardwaremap');
var webinterfacedb = $.couch.db('webinterface');

var now = new Date();
var fourDaysAgo = new Date();
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
var highVoltageDoc = {};
var hardwareMapDoc = {};

var dateOfDataOnDisplay = 0;
var timeBetweenMeasures = 30.0; //30 minutes between measures.. 

var dataForPlots = new Array();

var individualChart;

var plotContainer = [];
plotContainer.push([1,2,3,4,5,6]);
plotContainer.push([7,8,9,10,11,12,13,14]);
plotContainer.push([15,16,17,18,19,20,21,22]);
plotContainer.push([25,26,27,28]);
plotContainer.push([29,30,31,32]);
plotContainer.push([33,34,35,36,37,38]);
plotContainer.push([39,40,41,42,43]);
plotContainer.push([44,45,46,47,48]);
plotContainer.push([50,51]);

lb = function () { return document.createElement( 'BR' ); }

// fill plots container
for (var i = 0; i < plotContainer.length; i++){
  header = document.createElement("h3");
  header.innerHTML = "Modules: " + plotContainer[i][0] + "-" + plotContainer[i][plotContainer[i].length - 1];
  document.getElementById('plotscontainer').appendChild(  header );
  document.getElementById('plotscontainer').appendChild( lb() );
  var divId = "plots-data-" + plotContainer[i][0] + "-" + plotContainer[i][plotContainer[i].length - 1];
  nr = document.createElement("div");
  nr.setAttribute("class", "row");
  dv=document.createElement("div");
  dv.setAttribute("class", "span12");
  //dv.setAttribute("style", "width: 990px; margin: 0 auto")
  dv.setAttribute("id", divId);
  count = 0;
  var currentRow = document.createElement("div");
  currentRow.setAttribute("class", "row");
  for (var ii = 0; ii< plotContainer[i].length; ii++) {
    selector = document.getElementById('moduleselect');
    option=document.createElement("option");
    option.text=plotContainer[i][ii];
    try
    {
      // for IE earlier than version 8
      selector.add(option,x.options[null]);
    }
    catch (e)
    {
      selector.add(option,null);
    }

    moddv=document.createElement('div');
    moddv.setAttribute("class", "span4");
    moddv.setAttribute("style", "height: 200px")
    moddv.setAttribute("id", "module_" + plotContainer[i][ii]);
    console.log(moddv.outerHTML);
    currentRow.appendChild(moddv);

    count += 1;
    if (count % 3 == 0) {
      dv.appendChild(currentRow);
      currentRow = document.createElement("div");
      currentRow.setAttribute("class", "row");
    }

  }
  dv.appendChild(currentRow);
  nr.appendChild(dv);
  document.getElementById('plotscontainer').appendChild(nr);
  document.getElementById('plotscontainer').appendChild( lb() );
  document.getElementById('plotscontainer').appendChild( lb() );

} 
//  <div id="plots-data-1-6" class="span12">
// <div class="span6" id="module1" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   </div>
//                   <div id="plots-data-7-14" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   <div id="plots-data-15-22" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   <div id="plots-data-23-28" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   <div id="plots-data-29-32" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   <div id="plots-data-33-38" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   <div id="plots-data-39-43" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   <div id="plots-data-44-48" style="width: 400px; height: 200px; margin: 0 auto"></div>
//                   <div id="plots-data-49-51" style="width: 400px; height: 200px; margin: 0 auto"></div>

//txt=document.createTextNode('this is d3');
//dv.appendChild(txt);
//document.getElementById('plotscontainer').appendChild(dv);

$(document).ready(function() {

  //fill in the nav bar at the top of the page
  //using info in the webinterface database
  $.couch.db("webinterface").openDoc("navbar", {
    success: function(data) {
      var items = [];

      for (var link in data['list']){
        items.push('<li ><a href="' + link + '">' + data['list'][link] + '</a></li>');
      }
      $('#navbarList').append( items.join('') );

    }
  });


  

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
    

  $('#idate_i').datetimepicker({
    numberOfMonths: 1,
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    defaultDate: fourDaysAgo,
    addSliderAccess: true,
    sliderAccessArgs: { touchonly: false },
    onClose: function(dateText, inst) {
      var endDateTextBox = $('#fdate_i');
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
        $('#fdate_i').datetimepicker('option', 'minDate', new Date(start.getTime()));
      }
  });
          
  $('#fdate_i').datetimepicker({
    numberOfMonths: 1,
    showButtonPanel: true,
    defaultDate: now,
    changeMonth: true,
    changeYear: true,
    addSliderAccess: true,
    sliderAccessArgs: { touchonly: false },
    onClose: function(dateText, inst) {
      var startDateTextBox = $('#idate_i');
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
      $('#idate_i').datetimepicker('option', 'maxDate', new Date(end.getTime()) );
    }
  });
          
  $('#fdate_i').datetimepicker('setDate', now );
  $('#idate_i').datetimepicker('setDate', fourDaysAgo );

  $('.nav-tabs').button();
 
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
    
    getDataAndPlot();
  });

  $('#plotIndividualButton').click(function(e) {
    $('#plotIndividualButton').button('loading');
    getIndividualDataAndPlot();
  });
    
  
  hardwareMapDb.view('map/hv', {
    reduce:false,
    descending:true,
    async:false,
    success:function(data){
      jQuery.each(data.rows, function(i, row){
          
          //potential future problem!
          //this is not using the date of the hardwaremap configuration. this is okay for now
          //since there is only one valid date and the hardware map hasn't changed since then
          //but this should be supported in the future in the case that the map changes...  
          
          //... 
          if ( !(data.rows[i]["key"][0] in hardwareMapDoc)) {
           hardwareMapDoc[ data.rows[i]["key"][0] ] = {};
           console.log("adding to hardware map doc " + data.rows[i]["key"][0] );
          }
          console.log("   adding to hardware map doc " + data.rows[i]["key"][0] + " " + data.rows[i]["key"][1] + " = " + data.rows[i].value );
          hardwareMapDoc[data.rows[i]["key"][0] ][ data.rows[i]["key"][1] ] = data.rows[i].value;
          hardwareMapDoc[data.rows[i]["key"][0] ][ data.rows[i]["key"][1] ][ "date" ] = data.rows[i]["key"][2];
          
      });
      getLatestData(); 
    }
  });

  getDataAndPlot();
    
});

function getDateObjectForKeyArray(d)
{
  return new Date(d[0], d[1]-1, d[2], d[3], d[4], d[5], 0);  
}

function setNewDateForDataOnDisplay(d)
{
  dateOfDataOnDisplay = getDateObjectForKeyArray(d);
}

function getKeyArrayFromDateObject(nd)
{
  return [nd.getFullYear(), nd.getMonth()+1, nd.getDate(), nd.getHours(), nd.getMinutes(), nd.getSeconds()];
}

function getDataFromDateKey(skey)
{
  db.view('app/logbydate', {
    startkey: skey,
    reduce:false,
    limit:1,
    descending:true,
    include_docs:true,
    success:function(data){
      highVoltageDoc = data.rows[0]["doc"];
      fillHighVoltageTable(highVoltageDoc);
      setNewDateForDataOnDisplay( data.rows[0]["key"] );
    }
  });
}


function getLatestData()
{
  var now = new Date();
  getDataFromDateKey( getKeyArrayFromDateObject( now ) );

}

function getPreviousData()
{
  var nd = new Date(dateOfDataOnDisplay);
  nd.setMinutes(nd.getMinutes() - timeBetweenMeasures + 5.0);
  getDataFromDateKey( getKeyArrayFromDateObject(nd) );

}
function getNextData()
{
  var nd = new Date(dateOfDataOnDisplay);
  nd.setMinutes(nd.getMinutes() + timeBetweenMeasures + 5.0);
  getDataFromDateKey( getKeyArrayFromDateObject(nd) );

}

function fillHighVoltageTable(doc)
{
     $('.overview_table_body_elements').remove();
     var docDate = new Date(doc['date_valid']['unixtime']*1000.0);
     document.getElementById("latestvalues_date").innerHTML = docDate.toUTCString();
     
     for (key in hardwareMapDoc) {
       for (moduleEnd in hardwareMapDoc[key]) {
        var row = '<tr class="overview_table_body_elements">';
        row += '<td aligh="right">'+key+'</td>';
        row += '<td align="left">'+moduleEnd+'</td>';
        var hvChan = parseInt(hardwareMapDoc[key][moduleEnd]);
        row += '<td>'+hvChan+'</td>';
        row += '<td>'+ doc['values'][hvChan]['actual']+'</td>';    
        row += '<td>'+ doc['values'][hvChan]['demand']+'</td>';
        var diffClass = "";
        if (Math.abs(doc['values'][hvChan]['actual'] - doc['values'][hvChan]['demand']) > 10){
         diffClass = 'class="red-table-element"';
        } 
        else {
         diffClass = 'class="green-table-element"';
        } 
        var diffValue = doc['values'][hvChan]['actual'] - doc['values'][hvChan]['demand'];
       
        row += '<td '+diffClass+' >'+ diffValue +'</td>';  
        row += '<td>'+ doc['values'][hvChan]['saved']+'</td>';  
        row += '<td>'+ doc['values'][hvChan]['backup']+'</td>';    
        $('#latestvalues_table').append(row);
       }
     }
     $('.red-table-element').css("color","#f11");
     $('.green-table-element').css("color","rgb(15,99,30)");
     
     
     $("#latestvalues_table").trigger("update");
}

function getOptions(renderToId, chartTitle){
  
  var options = { 
      chart: {
         renderTo: renderToId,
         zoomType: 'xy',
         animation: false
         //spacingRight: 20
      },
       title: {
         text: chartTitle
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
                        return Highcharts.numberFormat(this.value, 0);
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
            lineWidth: 2,
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

function getDataAndPlot()
{

  $('#plotButton').button('loading');

  var skey = getKeyArrayFromDateObject( new Date( Date.parse($("#idate").val()) ) );
  var ekey = getKeyArrayFromDateObject( new Date( Date.parse($("#fdate").val()) ) );


  db.view('app/logbydate', {
    startkey: ekey,
    endkey: skey,
    reduce:false,
    descending:true,
    include_docs:true,
    success:function(data){
      dataForPlots = new Array();
      $.each(data.rows, function(i, row){
        //dateOfData = getDateObjectForKeyArray(row["doc"])
        dataForPlots.push([row["doc"]["date_valid"]["unixtime"], row["doc"]["values"] ]);
      });
      PlotData();
    }
  });

}

function PlotData()
{

  var chart; 

  for (var i = 0; i < plotContainer.length; i++){
    for (var ii = 0; ii <  plotContainer[i].length; ii++ ) {

      if (hardwareMapDoc.hasOwnProperty( plotContainer[i][ii] ) ) {

        options = getOptions( "module_" + plotContainer[i][ii], plotContainer[i][ii] );
        options["series"] = [];
        for (moduleEnd in hardwareMapDoc[ plotContainer[i][ii] ]) {

          dataSeries = {};
          dataSeries["name"] = moduleEnd;

          var data = [];
          for(var row in dataForPlots){
            //if(plotContainer[i][ii] == 13)
              //console.log(parseInt(dataForPlots[row][1][ parseInt(hardwareMapDoc[ plotContainer[i][ii] ][moduleEnd]) ]["actual"] ));
            data.push([ dataForPlots[row][0]*1000.0, parseInt(dataForPlots[row][1][ parseInt(hardwareMapDoc[ plotContainer[i][ii] ][moduleEnd]) ]["actual"] ) ] )
          }
          dataSeries["data"] = data;
          //console.log(data.length);
          options.series.push(dataSeries);

        }
        //if(plotContainer[i][ii] == 13)
          //console.log(options);

        //console.log(options.chart.renderTo);
        try{
          chart = new Highcharts.Chart(options);
        }
        catch(err)
        {
          console.log(err);
          console.log(document.getElementById(options.chart.renderTo));
        }
      }
      
    }
  }

  $('#plotButton').button('reset');

}

function getIndividualChartOption(chartTitle){
  
  var options = { 
      chart: {
         renderTo: "individualPlot",
         zoomType: 'xy',
         animation: true

         //spacingRight: 20
      },
       title: {
         text: chartTitle
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
         //min: 0.6,
         //startOnTick: false,
         showFirstLabel: false,
         labels: {
                    align: 'left',
                    x: 3,
                    y: -2,
                    formatter: function() {
                        return Highcharts.numberFormat(this.value, 0);
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
      plotOptions: {
         series: {
            lineWidth: 2,
            marker: {
               enabled: false
            },
            shadow: false
         }
      },
    };
    
    return options;
}

function addToIndividualChart(individualChart, modEnd, skey, ekey)
{
  db.view('app/hvread_bychannel_unixtime', {
      startkey: skey,
      endkey: ekey,
      reduce:false,
      descending:true,
      include_docs:false,
      async:false,
      success:function(data){
        dataSeries = {
          name: modEnd,
          data: []
        };

        $.each(data.rows, function(i, row){
            dataSeries.data.push([row["key"][1], row["value"] ]);
            //console.log( row["key"][1], row["value"]);
        });
      
        //console.log('adding to chart: ' + dataSeries.name);

        individualChart.addSeries(dataSeries);
        $('#plotIndividualButton').button('reset');
      }      
    });
}


function getIndividualDataAndPlot()
{


  startDate = Date.parse($("#idate_i").val());
  endDate = Date.parse($("#fdate_i").val());

  console.log(endDate);
  console.log(startDate);
  selector = document.getElementById('moduleselect');
  module = selector.options[selector.selectedIndex].text;
  hvChannel = [];
  chartOptions = getIndividualChartOption("Module " + module);
  chartOptions["series"] = [];
  

  try {
    var individualChart = new Highcharts.Chart(chartOptions);
  }
  catch(err) {
    console.log(err);
    console.log(document.getElementById(options.individualChart.renderTo));
    return;
  }

  for (modEnd in hardwareMapDoc[module]){
    hvChannel = parseInt(hardwareMapDoc[module][modEnd]);
    skey = [hvChannel, endDate];
    ekey = [hvChannel, startDate];


    addToIndividualChart(individualChart, modEnd, skey, ekey);

    
  }

}



//add cube stuff.....
// var props = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
//   prop,
//   el = document.createElement('div');

// var xAngle = 0, yAngle = 0;
// for(var i = 0, l = props.length; i < l; i++) {
//     if(typeof el.style[props[i]] !== "undefined") {
//       prop = props[i];
//       break;
//     }
//   }

// console.log('here');

// $('body').keydown(function(evt)
//   { 
//     console.log('in key down...');
//     console.log('key down! ' + evt.keyCode);
//     switch(evt.keyCode)
//     {
//       case 37: // left
//         yAngle -= 90;
//         break;

//       case 38: // up
//         xAngle += 90;
//         break;

//       case 39: // right
//         yAngle += 90;
//         break;

//       case 40: // down
//         xAngle -= 90;
//         break;
//     }

//     document.getElementById('cube').style[prop] = "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)";
//   }, false);


