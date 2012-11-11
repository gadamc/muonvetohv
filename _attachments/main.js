var db = $.couch.db(window.location.pathname.split("/")[1]);
var hardwareMapDb = $.couch.db('muonvetohardwaremap');
var webinterfacedb = $.couch.db('webinterface');
var appName = window.location.pathname.split("/")[3];


var now = new Date();
var fourDaysAgo = new Date();
fourDaysAgo.setDate(fourDaysAgo.getDate() - 1);

//var highVoltageDoc = {};

var hardwareMapDoc = {};

var dateOfDataOnDisplay = 0;
var timeBetweenMeasures = 30.0; //30 minutes between measures.. 

//var dataForPlots = new Array();

var totalNumberOfRows = 0;

var individualChart;

var allChannelList = [];


//
//
//
// fill plots container
//
//
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
//
//
// the following script must be run first before any asynchronous page loading.
//
// this script fills the plotscontainer with all of the individual plot elements
// which will later be filled with data
//
//

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
    //console.log(moddv.outerHTML);
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

//
//
//
//asynchronous javascript starts here. This first function is exectued once the page is loaded.
//
//
//
$(document).ready(function() {

  //
  // fill in the nav bar at the top of the page
  // using info in the webinterface database
  //
  //
  $.couch.db("webinterface").openDoc("navbar", {
    success: function(data) {
      var items = [];

      for (var link in data['list']){
        items.push('<li ><a href="' + link + '">' + data['list'][link] + '</a></li>');
      }
      $('#navbarList').append( items.join('') );

    }
  });



  //
  //
  //

  //boiler-plate timepicker setup.....
  
  //
  //

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



  //
  //
  // end of boiler plate for the datetimepicker objects
  //
  //
  //
  //



  // make the table sortable
  $("#latestvalues_table").tablesorter( );



  // set up the buttons
  $('.btn').button();
  
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
      fillTableForDate();
  });
      
  $('#plotButton').click(function(e) {
    getDataAndPlot();
  });

  $('#plotIndividualButton').click(function(e) {
    $('#plotIndividualButton').button('loading');
    getIndividualDataAndPlot();
  });
    

  //$('#latestvalues_table').ajaxComplete(function(e, xhr, settings) {
  //   console.log('\n and ajax request was completed\n!' )

  //   console.log(e);
  //   console.log(xhr);
  //   console.log(settings);
  //   $("#latestvalues_table").trigger("update");

  //   //i don't think i need to set this, right? 
  //   //i've included ithis is the css/style.css file
  //   //
  //   //$('.red-table-element').css("color","#f11");
  //   //$('.green-table-element').css("color","rgb(15,99,30)");

  // if (settings.url == 'ajax/test.html') {
  //   $(this).text('Triggered ajaxComplete handler. The result is ' +
  //                    xhr.responseHTML);
  // }

  //});


  //
  //get the list of high voltage modules and their ends
  //and then fill the table
  //
  fillAllChannelList(function(){
    //console.log(allChannelList);
    fillTableForDate();  //fill the table
  });
  
    

});

function fillAllChannelList(callbackFunction)
{
  hardwareMapDb.view('map/hv', {
    reduce:true,
    group_level:2,
    success:function(data){
      allChannelList = [];

      $.each(data.rows, function(i, row){  //note: jquery's 'each' function is synchronous
        allChannelList.push(row['key']);
        //console.log(row['key'])
      });
      
      callbackFunction();
    }
  });
}

function getChannelMapsForThisDate(aUnixTime, options)
{

  aUnixTime = typeof aUnixTime !== 'undefined' ? aUnixTime : (new Date()).valueOf()/1000.0;

  for(var i in allChannelList){
    
    hardwareMapDb.view('map/hv', {
      reduce:false,
      descending:true,
      limit:1,
      startkey :[allChannelList[i][0], allChannelList[i][1], aUnixTime],
      endkey: [allChannelList[i][0], allChannelList[i][1], 0],
      success:function(data){
        //console.log('getChannelMapsForThisDate: ' + data.rows[0]);
        //console.log(data)
        options.success( [ data.rows[0].key[0], data.rows[0].key[1], data.rows[0]['value'] ] );
      }
    });

  }
}

function setNewDateForDataOnDisplay(aUnixTime)
{
  dateOfDataOnDisplay = new Date(aUnixTime*1000.0);
}


// function getDataFromDateKey(aUnixTime)
// {

//   db.view(appName + '/logbydate', {
//     startkey: aUnixTime,
//     reduce:false,
//     limit:1,
//     descending:true,
//     include_docs:true,
//     success:function(data){
//       highVoltageDoc = data.rows[0]["doc"];
//       fillHighVoltageTable(highVoltageDoc);
//       setNewDateForDataOnDisplay( data.rows[0]["key"] );
//     }
//   });
// }

function getDataForHvChannel(aChannelMap, aUnixTime, options)
{
  hvChannel = aChannelMap[2];
  if(hvChannel <= 0) {
    if(options.error != undefined)
      options.error()
    console.log('no hv channel: ' + aChannelMap)
    return;
  }

  aUnixTime = typeof aUnixTime !== 'undefined' ? aUnixTime : (new Date()).valueOf()/1000.0;


  db.view(appName + '/hvread_bychannel_unixtime', {
    startkey: [hvChannel, aUnixTime],
    endkey: [hvChannel, 0],
    descending: true, 
    limit: 1,
    success: function(data){
      if(options.success != undefined)
        options.success( {'chaninfo':aChannelMap, 'data':data.rows[0]['value']} )
    }
  });
}

function fillTableForDate( aUnixTime )
{
  
  aUnixTime = typeof aUnixTime !== 'undefined' ? aUnixTime : (new Date()).valueOf()/1000.0;

  resetTable();
  setDateToDisplay(aUnixTime);

  getChannelMapsForThisDate( aUnixTime, {

    success:function(aChannelMap){

      getDataForHvChannel( aChannelMap, aUnixTime, {
        
        success:function(resp){
          //console.log(resp);
          addTableRow(resp['chaninfo'][0], resp['chaninfo'][1], resp['chaninfo'][2], resp['data'] );
        }
      });
    }
  });
}

function resetTable()
{
  $('.overview_table_body_elements').remove();
}

function setDateToDisplay(aUnixTime)
{
  aUnixTime = typeof aUnixTime !== 'undefined' ? aUnixTime : (new Date()).valueOf()/1000.0;

  db.view(appName + '/logbydate', {
    startkey: aUnixTime,
    reduce:false,
    limit:1,
    descending:true,
    include_docs:false,
    success:function(data){
      setNewDateForDataOnDisplay( data.rows[0]["key"] );
      document.getElementById("latestvalues_date").innerHTML = dateOfDataOnDisplay.toUTCString();
    }
  });

}

function addTableRow(moduleNumber, moduleEndName, hvChan, hvValues)
{
  var row = '<tr class="overview_table_body_elements">';
  row += '<td aligh="right">'+ moduleNumber +'</td>';
  row += '<td align="left">'+ moduleEndName +'</td>';
  row += '<td>'+hvChan+'</td>';

  row += '<td>'+ hvValues['actual']+'</td>';    
  row += '<td>'+ hvValues['demand']+'</td>';

  var diffClass = "";
  if (Math.abs(hvValues['actual'] - hvValues['demand']) > 10){
   diffClass = 'class="red-table-element"';
  } 
  else {
   diffClass = 'class="green-table-element"';
  } 
  var diffValue = hvValues['actual'] - hvValues['demand'];
 
  row += '<td '+diffClass+' >'+ diffValue +'</td>';  
  row += '<td>'+ hvValues['saved']+'</td>';  
  row += '<td>'+ hvValues['backup']+'</td>';    
  
  $('#latestvalues_table').append(row);

  //is this the right place?
  //console.log(' I am done!' )
  $("#latestvalues_table").trigger("update");

  //i don't think i need to set this, right? 
  //i've included ithis is the css/style.css file
  //
  //$('.red-table-element').css("color","#f11");
  //$('.green-table-element').css("color","rgb(15,99,30)");

}

function getPreviousData()
{
  var nd = new Date(dateOfDataOnDisplay);
  nd.setMinutes(nd.getMinutes() - timeBetweenMeasures + 5.0);

  fillTableForDate( nd.valueOf()/1000.0 );
}

function getNextData()
{
  var nd = new Date(dateOfDataOnDisplay);
  nd.setMinutes(nd.getMinutes() + timeBetweenMeasures + 5.0);

  fillTableForDate( nd.valueOf()/1000.0 );
}

// function fillHighVoltageTable(doc)
// {
//      $('.overview_table_body_elements').remove();
//      var docDate = new Date(doc['date_valid']['unixtime']*1000.0);
//      document.getElementById("latestvalues_date").innerHTML = docDate.toUTCString();
     
//      for (key in hardwareMapDoc) {
//        for (moduleEnd in hardwareMapDoc[key]) {
//         var row = '<tr class="overview_table_body_elements">';
//         row += '<td aligh="right">'+key+'</td>';
//         row += '<td align="left">'+moduleEnd+'</td>';
//         var hvChan = parseInt(hardwareMapDoc[key][moduleEnd]);
//         row += '<td>'+hvChan+'</td>';
//         row += '<td>'+ doc['values'][hvChan]['actual']+'</td>';    
//         row += '<td>'+ doc['values'][hvChan]['demand']+'</td>';
//         var diffClass = "";
//         if (Math.abs(doc['values'][hvChan]['actual'] - doc['values'][hvChan]['demand']) > 10){
//          diffClass = 'class="red-table-element"';
//         } 
//         else {
//          diffClass = 'class="green-table-element"';
//         } 
//         var diffValue = doc['values'][hvChan]['actual'] - doc['values'][hvChan]['demand'];
       
//         row += '<td '+diffClass+' >'+ diffValue +'</td>';  
//         row += '<td>'+ doc['values'][hvChan]['saved']+'</td>';  
//         row += '<td>'+ doc['values'][hvChan]['backup']+'</td>';    
//         $('#latestvalues_table').append(row);
//        }
//      }
     
     
     
//      $("#latestvalues_table").trigger("update");
// }

function getOptions(renderToId, chartTitle){
  
  var options = { 
      chart: {
         renderTo: renderToId,
         zoomType: 'xy',
         animation: true
         //spacingRight: 20
      },
       title: {
         text: chartTitle
      },
      xAxis: {
         type: 'datetime',
         minRange: 1000.0* 60.0 * 60.0, // 60 minutes
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
            animation: true,
            enableMouseTracking: false,
            stickyTracking: false
         }
      },
    };
    
    return options;
}



function getDataAndPlot()
{

  startDate = Date.parse($("#idate").val());
  endDate = Date.parse($("#fdate").val());
    

  for (module in hardwareMapDoc){

    chartOptions = getOptions("module_" + module, module);
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



      addToIndividualChart(individualChart, 
      modEnd, 
      skey, 
      ekey, 
      function (){
        $('#plotButton').button('reset');
      });

    }
  }

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
         minRange: 1000.0* 60.0 * 60.0, // 60 minutes
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

function addToIndividualChart(individualChart, modEnd, skey, ekey, callbackFunction)
{

  db.view(appName + '/hvread_bychannel_unixtime', {
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
            dataSeries.data.push([row["key"][1], row["value"]['actual'] ]);
            //console.log( row["key"][1], row["value"]);
            totalNumberOfRows = totalNumberOfRows + 1;
        });
      
        //console.log('adding to chart: ' + dataSeries.name);

        individualChart.addSeries(dataSeries);
        callbackFunction();
        console.log('new number of rows ' + totalNumberOfRows.toString());        
      }      
    });
}



function getIndividualDataAndPlot()
{

  startDate = Date.parse($("#idate_i").val());
  endDate = Date.parse($("#fdate_i").val());

  selector = document.getElementById('moduleselect');
  module = selector.options[selector.selectedIndex].text;
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


    addToIndividualChart(individualChart, 
      modEnd, 
      skey, 
      ekey, 
      function (){
        $('#plotIndividualButton').button('reset');
    });

  }

}


