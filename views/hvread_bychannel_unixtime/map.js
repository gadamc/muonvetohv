function(doc) {
  if(doc.type == 'muonvetohvlog') {
    for(var i = 0; i < doc['values'].length; i++){
      if( isNaN(doc['values'][i]['actual']) == false) 
        emit([doc['values'][i]['channel'], doc['date_valid']['unixtime']*1000.0], doc['values'][i]['actual'] );
    }
  }
}