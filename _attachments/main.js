var db = $.couch.db(window.location.pathname.split("/")[1]);
var hardwareMapDb = $.couch.db('muonvetohardwaremap');
var webinterfacedb = $.couch.db('webinterface');
var appName = window.location.pathname.split("/")[3];




//var highVoltageDoc = {};

var hardwareMapDoc = {};

var dateOfDataOnDisplay = 0;
var timeBetweenMeasures = 30.0; //30 minutes between measures.. 

//var dataForPlots = new Array();

var totalNumberOfRows = 0;
var allChannelList = [];
var chartPointerStore = {};

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

for(var i=0, len=plotContainer.length; i < len; i++){

  var header = document.createElement("h3");
  header.innerHTML = "Modules: " + plotContainer[i][0] + "-" + plotContainer[i][plotContainer[i].length - 1];
  document.getElementById('plotscontainer').appendChild(  header );
  document.getElementById('plotscontainer').appendChild( lb() );
  var divId = "plots-data-" + plotContainer[i][0] + "-" + plotContainer[i][plotContainer[i].length - 1];
  var nr = document.createElement("div");
  nr.setAttribute("class", "row");
  var dv=document.createElement("div");
  dv.setAttribute("class", "span12");
  //dv.setAttribute("style", "width: 990px; margin: 0 auto")
  dv.setAttribute("id", divId);
  var count = 0;
  var currentRow = document.createElement("div");
  currentRow.setAttribute("class", "row");
  
  for(var ii=0, lenlen=plotContainer[i].length; ii < lenlen; ii++){

    var selector = document.getElementById('moduleselect');
    var option=document.createElement("option");
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

    var moddv=document.createElement('div');
    moddv.setAttribute("class", "span4");
    moddv.setAttribute("style", "height: 200px")
    moddv.setAttribute("id", "highchart_for_module_" + plotContainer[i][ii]);

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
      totalNumberOfRows += data.rows.length;

      $.each(data.rows, function(i, row){  //note: jquery's 'each' function is synchronous
        allChannelList.push(row['key']);
      });
      
      callbackFunction();
    }
  });
}

function getChannelMaps(options)
{


  options = typeof options !== 'undefined' ? options : {};

  options.starttime = typeof options.starttime !== 'undefined' ? options.starttime : (new Date()).valueOf()/1000.0;
  options.endtime = typeof options.endtime !== 'undefined' ? options.endtime : 0;
  options.chanlist = typeof options.chanlist !== 'undefined' ? options.chanlist : allChannelList;


  var viewOpts = {
    reduce:false,
    descending:true  
  }

  if("handler" in options){
    viewOpts.success = function(data){
      totalNumberOfRows += data.rows.length;

      var chanMap = []
      //and now my spaghetti code has come full circle
      //where i'm just rewrapping the data from the view
      //into an array of little objects
      $.each(data.rows, function(i,row){
        chanMap.push({
          'module':row.key[0],
          'end': row.key[1],
          'time':row.key[2],
          'hvchan': row['value']
        });

      });

      options.handler( chanMap );
    };
  }

  if("limit" in options)
    viewOpts.limit = options.limit



  for(var  i=0, len=options.chanlist.length; i<len; i++){
    
    viewOpts.startkey  = [options.chanlist[i][0], options.chanlist[i][1], options.starttime],
    viewOpts.endkey = [options.chanlist[i][0], options.chanlist[i][1], options.endtime],

    hardwareMapDb.view('map/hv', viewOpts);

  }

}

function setNewDateForDataOnDisplay(aUnixTime)
{
  dateOfDataOnDisplay = new Date(aUnixTime*1000.0);
}


function getDataForHvChannel(aChannelMap, aUnixTime, options)
{
  //aChannelMap['module'] = module number
  //aChannelMap['end'] = module end name
  //aChannelMap['time'] = start time of valid mapping
  //aChannelMap['hvchan'] = hv channel

  var hvChannel = aChannelMap['hvchan'];
  if(hvChannel <= 0) {
    if(options.error != undefined)
      options.error()

    return;
  }

  aUnixTime = typeof aUnixTime !== 'undefined' ? aUnixTime : (new Date()).valueOf()/1000.0;


  db.view(appName + '/hvread_bychannel_unixtime', {
    startkey: [hvChannel, aUnixTime],
    endkey: [hvChannel, 0],
    descending: true, 
    limit: 1,
    success: function(data){
      totalNumberOfRows+=1
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

  getChannelMaps( {
    starttime: aUnixTime,
    endtime: 0,
    limit:1,
    handler:function(aChannelMapArray){
      
      //this should NEVER happen
      if(aChannelMapArray.length == 0) {
        console.log('boo. channel map array size zero in fillTableForDate')
        return;
      }

      //since limit = 1, i know there must only be 
      //one map
      getDataForHvChannel( aChannelMapArray[0], aUnixTime, {
        
        success:function(resp){
          addTableRow(
            resp['chaninfo']['module'], 
            resp['chaninfo']['end'], 
            resp['chaninfo']['hvchan'], 
            resp['data'] 
          );
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
      totalNumberOfRows+=1
      setNewDateForDataOnDisplay( data.rows[0]["key"] );
      document.getElementById("latestvalues_date").innerHTML = dateOfDataOnDisplay.toUTCString();
    }
  });

}

function addTableRow(moduleNumber, moduleEndName, hvChan, hvValues)
{
  var docId = 'overview_table_row_'+ moduleNumber + moduleEndName;

  var row = '<tr class="overview_table_body_elements" id="' + docId + '">';
  row += '<td>'+ moduleNumber +'</td>';
  row += '<td>'+ moduleEndName +'</td>';
  row += '<td>'+hvChan+'</td>';

  row += '<td>'+ hvValues['actual']+'</td>';    
  row += '<td>'+ hvValues['demand']+'</td>';

  var diffClass = "";
  if (Math.abs(hvValues['actual'] - hvValues['demand']) > 10){
   diffClass = 'class="red-table-element error"';
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
  $("#latestvalues_table").trigger("update");

  if(hvValues['demand'] == 0){
    $('#' + docId).addClass("info")
  }
  else{
    if (Math.abs(hvValues['actual'] - hvValues['demand']) > 10)
      $('#' + docId).addClass("error")   
    else 
      $('#' + docId).addClass("success")  
  }


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

function getDefaultChartOptions(renderToId, chartTitle){
  
  var options = { 
      chart: {
         renderTo: renderToId,
         type: 'scatter',
         zoomType:'xy',
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
         }
      },
      yAxis: {
         title: {
            text: null
         },
         //min: 0.6,
         //startOnTick: false,
         showFirstLabel: false,
         // labels: {
         //            align: 'left',
         //            x: 3,
         //            y: -2,
         //            formatter: function() {
         //                return Highcharts.numberFormat(this.value, 0);
         //            }
         //        }
      },
    //   legend: {
		  // align: 'left',
		  // verticalAlign: 'top',
		  // y: 20,
		  // x: 80,
		  // floating: true,
		  // borderWidth: 0
    //   },
      // tooltip: {
      //    shared: false,
      //    enabled: false
      // },
      // plotOptions: {
      //    series: {
      //       fillColor: {
      //          linearGradient: [0, 0, 0, 300],
      //          stops: [
      //             [0, Highcharts.theme.colors[0]],
      //             [1, 'rgba(2,0,0,0)']
      //          ]
      //       },
      //       lineWidth: 2,
      //       marker: {
      //          enabled: false
      //       },
      //       shadow: false, 
      //       animation: true,
      //       enableMouseTracking: false,
      //       stickyTracking: false
      //    }
      // },
      series: []
    };
    
    return options;
}




function getIndividualChartOption(chartTitle)
{
  
  var options = getDefaultChartOptions('individualPlot', chartTitle);

  //options.plotOptions.series.enableMouseTracking = true;
  //options.plotOptions.series.stickyTracking = true;
  //options.tooltip.enabled = true;
  //options.tooltip.shared = true;

  return options;

}

function addToIndividualChart(theChart, modEnd, skey, ekey, callbackFunction)
{
  if(typeof theChart == undefined){
    throw TypeError('the chart is undefined?....wtf?');
  }

  db.view(appName + '/hvread_bychannel_unixtime', {
      startkey: skey,
      endkey: ekey,
      reduce:false,
      descending:true,
      include_docs:false,
      success:function(couchData){

        if(typeof theChart == undefined){
          throw TypeError('the chart is undefined? in the couchdb view success function....wtf?');
        } 

        // console.log(couchData.rows.length);
        totalNumberOfRows += couchData.rows.length;

        var seriesList = theChart.series;
        
        var addNew = true;
        var previousDataArray;
        var theSeriesIndex = -1;
        var dataSeries;

        try{
          // console.log('current series list length' + seriesList.length);

          $.each(seriesList, function(i, aseries){
            if(aseries.name == modEnd){
              theSeriesIndex = i;
              previousDataArray = $.extend(true, [], aseries.data);  //make a deep copy of the data.

              addNew = false;
              return false;
            }
          });
          // console.log('did not catch error...serlist is:  ' + typeof seriesList);
          // console.log('did not catch error...chart is:  ' + typeof theChart);
        }
        catch(err){
          //this error occurs because the seriesList doesn't have a .length property that
          //jquery needs to perform the loop....
          //
          if (err instanceof TypeError != true )
            throw err;
          
          //console.log('caught error...serlist is:  '+  typeof seriesList);
        }
       

        if (addNew){
       
        
          var localArray = [];
          $.each(couchData.rows, function(i, row){
            localArray.push([row["key"][1]*1000.0, row["value"]['actual'] ]);
          });

          try{
            dataSeries = theChart.addSeries({
              name: modEnd,
              data: localArray
            });
          }
          catch(err){
            // console.log('caught error when addSeries was called');
            // console.log('thechart is type: ' + typeof theChart);
            // console.log('dataSeries is type: ' + typeof dataSeries);
            // console.log('seriesList is type: ' + typeof seriesList);
          }
        }
        else{
          dataSeries = theChart.series[theSeriesIndex];
          $.each(couchData.rows, function(i, row){
            dataSeries.addPoint( [row["key"][1]*1000.0, row["value"]['actual'] ], false );

          }); 
          dataSeries.chart.redraw();
          
        }
        
        
        if(callbackFunction != undefined)
          callbackFunction();

      }      
    });
}

function fillInChart(startDate, endDate, moduleNumber, aChart)
{

  var myChannelList = [ ];

  for (var ii=0, len=allChannelList.length; ii<len; ii++){
    if(allChannelList[ii][0] == moduleNumber)
      myChannelList.push( allChannelList[ii] );
  }

  getChannelMaps({
    starttime: startDate, 
    endtime: 0,
    limit: 1,
    chanlist: myChannelList,
    handler:function(theStartTimeMapArray){
      
      
      if(theStartTimeMapArray.length == 0){
        console.log('booo!');
        return;
      }

      //
      //theStartTimeMapArray gives the mapping between the module+channel and the hvChannel
      //that is most recently defined before startDate (startDate is the user-selected first starting point)
      //
      //
      //now, i call getChannelMaps again between the user-defined times to see if there are anymore
      //map definitions that may have occurred during the period the user wishes to view
      //

      //so that we don't duplicate calls, have to build a new local sublist
      var justThisChannel = [ [ theStartTimeMapArray[0]['module'], theStartTimeMapArray[0]['end'] ] ];

      getChannelMaps({
        starttime: endDate,
        endtime: startDate,
        chanlist: justThisChannel,

        handler:function(anotherMapArray){
        
          if(anotherMapArray.length > 0){
            //
            //if there are multiple mappings throughout the time-period selected by the user
            //then add data to the chart for each time-period interval as defined by the returned
            //anotherMapArray 
            //

            var previousStartDate = startDate;
            var previousMap = theStartTimeMapArray[0];  //ajax might not like this. theStartTimeMapArray may not be what you think it is when this is called!!

            for(var k=0, len=anotherMapArray.length; k < len; k++){
              var aChannelMap = anotherMapArray[k];
              

              addToIndividualChart(aChart, 
                previousMap['end'], 
                [previousMap['hvchan'], aChannelMap['time']], 
                [previousMap['hvchan'], previousStartDate]
              );
              previousMap = aChannelMap;
              previousStartDate = aChannelMap['time'];
            }
            
            addToIndividualChart(aChart, 
              previousMap['end'], 
              [previousMap['hvchan'], endDate], 
              [previousMap['hvchan'], previousStartDate],
              function (){
                //aChart.redraw();
                $('#plotIndividualButton').button('reset');
              }
            );

          }
          //if there was just the one single mapping, then use it
          //to make the plot over the entire user selected time-period
          //
          else{
            var aChannelMap = theStartTimeMapArray[0];

            addToIndividualChart(aChart, 
              aChannelMap['end'], 
              [aChannelMap['hvchan'], endDate], 
              [aChannelMap['hvchan'], startDate],
              function (){
                //aChart.redraw();
                $('#plotIndividualButton').button('reset');
              }
            );
          }//end else

        }//end 2nd handler

      }); //end 2nd getChannelMaps call

    }//end 1st handler

  });//end 1st getChannelMaps call
}


function getIndividualDataAndPlot()
{

  var startDate = Date.parse($("#idate_i").val())/1000.0;
  var endDate = Date.parse($("#fdate_i").val())/1000.0;

  var selector = document.getElementById('moduleselect');
  var module = selector.options[selector.selectedIndex].text;

  try{
      chartPointerStore['individualChart'].destroy()
    }
    catch(err){
      //do nothing;
      //console.log('failed to destroy a chart...' + module);
    }

  try {
    var aChart = new Highcharts.Chart( getIndividualChartOption("Module " + module) );
    fillInChart(startDate, endDate, module, aChart);  
    chartPointerStore['individualChart'] = aChart;
  }
  catch(err) {
    console.log(err);
    console.log(document.getElementById( aChart.renderTo ));
    return;
  }

  

}



function getDataAndPlot()
{

  var startDate = Date.parse($("#idate").val())/1000.0;
  var endDate = Date.parse($("#fdate").val())/1000.0;
    

  for (var ii = 0, len = allChannelList.length; ii< len; ii++){
    module = allChannelList[ii][0];

    try{
      chartPointerStore['module_'+module].destroy()
    }
    catch(err){
      //do nothing;
      //console.log('failed to destroy a chart...' + module);
    }

    try {
      var aChart = new Highcharts.Chart( getDefaultChartOptions("highchart_for_module_" + module, module) );
      chartPointerStore['module_'+module] = aChart;
      fillInChart(startDate, endDate, module, aChart);  

    }
    catch(err) {
      console.log(err);
      console.log(document.getElementById(options.aChart.renderTo));
    }

  }

}



