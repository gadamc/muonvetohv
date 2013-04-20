var now = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60000);
var initialStartDate = new Date( new Date().getTime() + new Date().getTimezoneOffset()*60000 );
initialStartDate.setHours(initialStartDate.getHours() - 12);

$(document).ready(function() {

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
    defaultDate: initialStartDate,
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
  $('#idate').datetimepicker('setDate', initialStartDate );
    

  $('#idate_i').datetimepicker({
    numberOfMonths: 1,
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    defaultDate: initialStartDate,
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
  $('#idate_i').datetimepicker('setDate', initialStartDate );

  $('#tableDate').datetimepicker({
    numberOfMonths: 1,
    showButtonPanel: true,
    changeMonth: true,
    changeYear: true,
    defaultDate: now,
    addSliderAccess: true,
    sliderAccessArgs: { touchonly: false }
  });

  $('#tableDate').datetimepicker('setDate', now );


  //
  //
  // end of boiler plate for the datetimepicker objects
  //
  //
  //
  //





});
