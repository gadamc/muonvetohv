function(doc) {
  if(doc.type == 'muonvetohvwarninglogfile' && doc.notificationstatus  && doc.date_valid_unixtime)
  emit(doc.date_valid_unixtime, 1);
}