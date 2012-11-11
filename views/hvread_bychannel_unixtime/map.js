function(doc) {
  if(doc.type == 'muonvetohvlog'  && doc.date_valid_unixtime) {
    for(var i = 0; i < doc['values'].length; i++){
      if( isNaN(doc['values'][i]['actual']) == false) 
      	outPut = {
      		'actual': doc['values'][i]['actual'],
      		'saved': doc['values'][i]['saved'],
      		'demand': doc['values'][i]['demand'],
      		'backup': doc['values'][i]['backup']
      	}

        emit([doc['values'][i]['channel'], doc.date_valid_unixtime], outPut );
    }
  }
}