function(doc) {
  if(doc.type == 'muonvetohvlog' && doc.date_valid_unixtime)
  emit(doc.date_valid_unixtime, 1);
}