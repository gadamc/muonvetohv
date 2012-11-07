function(doc) {
  if(doc.type == 'muonvetohvwarninglogfile' && doc.notificationstatus == 'none'  && doc.date_valid_unixtime)
  emit(doc.date_valid_unixtime, 1);
}