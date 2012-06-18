var dbname = window.location.pathname.split("/")[1];
var appName = window.location.pathname.split("/")[3];
var db = $.couch.db(dbname);

var currentRunName = "";
var currentFileNumber = 0;
var currentSamba = "";

var savedData = {};
var sambaList = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

// ____________________________________________________________________________________
$(document).ready(function(){

   // Tabs
   $('.tabs').tabs();
   
   $('.tabs').bind('change', function (e) {
     setActivePane(e);  
     if(e.target.innerHTML != 'select run')        
       getSambaData(e.target.innerHTML); 
   });
   
   
   // Buttons
   $('.btn').button();
   
   $('#getRunButton').click( function(e) {
      getSelectData();
   });
   
   $('#getLatestButton').click( function(e) {
       getSambaData(currentSamba);
    });
    
    
   $('#getPreviousFileButton').click( function(e) {
     if( $('#getPreviousFileButton').hasClass('disabled') == false)
      getPreviousSambaData();
   });
    
   $('#getNextFileButton').click( function(e) {
     if( $('#getNextFileButton').hasClass('disabled') == false)
        getNextSambaData();
   }); 
   
    $('#getPreviousRunButton').click( function(e) {
      if( $('#getPreviousRunButton').hasClass('disabled') == false)
       getPreviousSambaRunData();
    });

    $('#getNextRunButton').click( function(e) {
      if( $('#getNextRunButton').hasClass('disabled') == false)
         getNextSambaRunData();
    });
    
    $('#refreshOverviewButton').click( function(e) {
      refreshOverview();
    });
     
   // Template - output
    $.get('templates/output_withrows.html', function(tmp) {               
       $.template("output_template", tmp);  
    });
    
   
   //make table sortable and then fill it
   $("#overview_table").tablesorter( );
   //fillOverviewTable();
   refreshOverview();
   
   //just run all of these to fill in the savedData on the initial load up!. 
   for (var i in sambaList)
    getSambaData(sambaList[i]);
  
   
});

//-----------------------------
function setActivePane(e)
{
  if(e.target.innerHTML == 'select run'){
    
    if($("#tab-samba-pane").hasClass("active"))
      $("#tab-samba-pane").removeClass("active");
      
    if($("#tab-overview-pane").hasClass("active"))
      $("#tab-overview-pane").removeClass("active");
        
    if($("#tab-selectrun-pane").hasClass("active") == false)
      $("#tab-selectrun-pane").addClass("active");
    
  }
  else if(e.target.innerHTML == 'overview'){
    
     if($("#tab-samba-pane").hasClass("active"))
       $("#tab-samba-pane").removeClass("active");

     if($("#tab-selectrun-pane").hasClass("active"))
       $("#tab-selectrun-pane").removeClass("active");

     if($("#tab-overview-pane").hasClass("active") == false)
       $("#tab-overview-pane").addClass("active");
   }
  else{
    
    if($("#tab-overview-pane").hasClass("active"))
       $("#tab-overview-pane").removeClass("active");

    if($("#tab-selectrun-pane").hasClass("active"))
       $("#tab-selectrun-pane").removeClass("active");

    if($("#tab-samba-pane").hasClass("active") == false)
       $("#tab-samba-pane").addClass("active");
       
  }
  
}

//-----------------------------
function sanitize(obj){  //should I put this functionality into a show function on the server-side. it may be nice to have this option available elsewhere
   if(obj == null || typeof(obj) != 'object')
     return obj;

   var temp = obj.constructor(); 
   
   var patt = new RegExp('[.-]','g');
   for(var key in obj) 
     temp[key.replace(patt,'_')] = sanitize(obj[key]);
   return temp;
 }
 
 
//---------------------------------
function fillDataContainer(containerName, doc)
{
  doc = sanitize( doc );
  
  $(containerName).html( $.tmpl("output_template",  doc ));
  currentRunName = doc['run_name'];
  currentFileNumber = doc['file_number'];
   
  $('.autoheight').css("height", "auto")
  $('.divtocollapse').css("color", "blue")
  $('.iCanCollapse').hide();
  $(".divtocollapse").click(function(){
    $(this).next('.iCanCollapse').slideToggle(500);
  });
}
 
 
//_____________________________________________________________________________________
function getSambaData(sambaName)
{
   
   currentSamba = sambaName;
   if(savedData[sambaName])
    fillDataContainer("#tab-samba-container", savedData[sambaName]);
   
   db.view(appName + "/samba",  {
     endkey:[sambaName,"", 0],
     startkey:[sambaName,"zz99z999",999999],
     reduce:false,
     limit:2,
     include_docs:true,
     descending:true,
     success:function(data){
       if ( data.rows.length > 0 ) {                     
         fillDataContainer("#tab-samba-container", data.rows[0]['doc']);
         savedData[sambaName] = data.rows[0]['doc'];
         
         if (data.rows.length > 1){
           if( $('#getPreviousFileButton').hasClass('disabled') == true)
               $('#getPreviousFileButton').removeClass('disabled');
         }
         else {
           if( $('#getPreviousFileButton').hasClass('disabled') == false)
                $('#getPreviousFileButton').addClass('disabled');
         }
         
            
         if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
        
          
         if( $('#getNextRunButton').hasClass('disabled') == false)
            $('#getNextRunButton').addClass('disabled');
       }
       else{
         $("#tab-samba-container").html("<h5>no data available...</h5>");
         
         if( $('#getPreviousFileButton').hasClass('disabled') == false)
            $('#getPreviousFileButton').addClass('disabled');
            
         if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
       }
     },
     error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    
   });
}


//_____________________________________________________________________________________
function getPreviousSambaData()
{
  
  
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"", 0],
     startkey:[currentSamba,currentRunName,currentFileNumber],
     reduce:false,
     limit:3,
     include_docs:true,
     descending:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-container", data.rows[1]['doc']);

         if (data.rows.length > 2){
            if( $('#getPreviousFileButton').hasClass('disabled') == true)
                $('#getPreviousFileButton').removeClass('disabled');
         }
         else {
            if( $('#getPreviousFileButton').hasClass('disabled') == false)
                 $('#getPreviousFileButton').addClass('disabled');
         }
          
         if( $('#getNextFileButton').hasClass('disabled') == true)
            $('#getNextFileButton').removeClass('disabled');
       }
       else{
          if( $('#getPreviousFileButton').hasClass('disabled') == false)
            $('#getPreviousFileButton').addClass('disabled');
       }
     },
     error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    
   });
}

//_____________________________________________________________________________________
function getNextSambaData()
{
  
   //console.log('get next from ' + currentSamba + ' ' + currentRunName + ' ' + currentFileNumber);
   
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"zz99z999",999999],
     startkey:[currentSamba,currentRunName,currentFileNumber],
     reduce:false,
     limit:3,
     include_docs:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-container", data.rows[1]['doc']);
         
         if (data.rows.length > 2){
           if( $('#getNextFileButton').hasClass('disabled') == true)
               $('#getNextFileButton').removeClass('disabled');
         }
         else {
           if( $('#getNextFileButton').hasClass('disabled') == false)
                $('#getNextFileButton').addClass('disabled');
         }
         
         if( $('#getPreviousFileButton').hasClass('disabled') == true)
           $('#getPreviousFileButton').removeClass('disabled');
       }
       else{
          if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
          
       }
     },
     error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    
   });
}

//_____________________________________________________________________________________
function getPreviousSambaRunData()
{
  
  //console.log('get previous from ' + currentSamba + ' ' + currentRunName + ' ' + currentFileNumber);
     
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"", 0],
     startkey:[currentSamba,currentRunName,0],
     reduce:false,
     limit:3,
     include_docs:true,
     descending:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-container", data.rows[1]['doc']);
         
         if (data.rows.length > 2){
            if( $('#getPreviousRunButton').hasClass('disabled') == true)
                $('#getPreviousRunButton').removeClass('disabled');
         }
         else {
            if( $('#getPreviousRunButton').hasClass('disabled') == false)
                 $('#getPreviousRunButton').addClass('disabled');
         }
          
         if( $('#getNextRunButton').hasClass('disabled') == true)
            $('#getNextRunButton').removeClass('disabled');
        
         if( $('#getNextFileButton').hasClass('disabled') == true)
            $('#getNextFileButton').removeClass('disabled');
       }
       else{
          if( $('#getPreviousRunButton').hasClass('disabled') == false)
            $('#getPreviousRunButton').addClass('disabled');
        
          if( $('#getPreviousFileButton').hasClass('disabled') == false)
            $('#getPreviousFileButton').addClass('disabled');
       }
     },
     error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    
   });
}

//_____________________________________________________________________________________
function getNextSambaRunData()
{
  
   //console.log('get next from ' + currentSamba + ' ' + currentRunName + ' ' + currentFileNumber);
   
   db.view(appName + "/samba",  {
     endkey:[currentSamba,"zz99z999",999999],
     startkey:[currentSamba,currentRunName,9999999],
     reduce:false,
     limit:3,
     include_docs:true,
     success:function(data){
       if ( data.rows.length > 1 ) {                     
         fillDataContainer("#tab-samba-container", data.rows[1]['doc']);
         
         if (data.rows.length > 2){
           if( $('#getNextRunButton').hasClass('disabled') == true)
               $('#getNextRunButton').removeClass('disabled');
         }
         else {
           if( $('#getNextRunButton').hasClass('disabled') == false)
                $('#getNextRunButton').addClass('disabled');
         }
         
         if( $('#getPreviousRunButton').hasClass('disabled') == true)
           $('#getPreviousRunButton').removeClass('disabled');
       }
       else{
          if( $('#getNextRunButton').hasClass('disabled') == false)
            $('#getNextRunButton').addClass('disabled');
            
          if( $('#getNextFileButton').hasClass('disabled') == false)
            $('#getNextFileButton').addClass('disabled');
          
       }
     },
     error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    
   });
}

//---------------------------------
function getSelectData()
{
  var runName = $('#selectRunInput').val();
  var fileNum = "";
  if ($('#selectFileInput').val() != "")
    fileNum = parseInt($('#selectFileInput').val());
  
  console.log("requesting" + [runName, fileNum]);
  if (fileNum === "") {
    
    db.view(appName + "/run", {
      endkey:[runName, 0],
      startkey:[runName, 9999999],
      descending:true,
      reduce:false,
      limit:1,
      include_docs:true,
      success:function(data){                     
         if ( data.rows.length > 0 ) {                     
            fillDataContainer("#selectrun-samba-container", data.rows[0]['doc']);
            
          }
          else{
            $("#selectrun-samba-container").html("<h5>no data available...</h5>");
          }
       },
       error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
    
  }
  else{
    db.view(appName + "/run", {
      key:[runName, fileNum],
      reduce:false,
      include_docs:true,
      success:function(data){                     
         if ( data.rows.length > 0 ) {                     
            fillDataContainer("#selectrun-samba-container", data.rows[0]['doc']);
          
          }
          else{
            $("#selectrun-samba-container").html("<h5>no data available...</h5>");
          }
       },
       error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
  }
}

//----------------------------------------------------
function fillOverviewTable()
{
  
  for (var i in sambaList){
    db.view(appName + "/sambaoverview",  {
       key:sambaList[i],
       reduce:false,
       limit:1,
       include_docs:true,
       descending:true,
       async:false,
       success:function(data){
         if ( data.rows.length > 0 ) {  
               
           var row = '<tr class="overview_table_body_elements">' 
           row += '<td>'+data.rows[0]['key']+'</td>';
           var date = data.rows[0]['value'][1];
           row += '<td>'+ date.year +'-'+ date.month +'-'+ date.day +' '+ data.rows[0]['value'][2]+'</td>';    
           row += '<td>'+data.rows[0]['value'][0]+'</td>'
           row += '<td>'+data.rows[0]['value'][3]+'</td>'   
           $('#overview_table_body').append(row);
           
           $("#overview_table").trigger("update");
           
         }
       },
       error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}

     });
  }
  
 
}

//-------------------------------------------------
function refreshOverview()
{
  
  $('.overview_table_body_elements').remove();
  fillOverviewTable();
  
 
}

function setTableSort()
{
  
}
// ____________________________________________________________________________________
function enter_select(event) {    
 
   if (event.keyCode == 13) {  //keycode 13 is the enter key
             
      getSelectData();
      event.returnValue = false; // for IE
      if (event.preventDefault()) event.preventDefault(); 
   
   }

   return false;     
        
}