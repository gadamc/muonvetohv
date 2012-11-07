function(doc) {
  if(doc.type == 'muonvetohvlog'  && doc.date_valid_unixtime) {
    for(var i = 0; i < doc['values'].length; i++){
      if( isNaN(doc['values'][i]['actual']) == false) 
        emit([doc['values'][i]['channel'], doc.date_valid_unixtime*1000.0], doc['values'][i]['actual'] );
    }
  }
}