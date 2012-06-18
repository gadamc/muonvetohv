function(doc) {
  if(doc.type == 'muonvetohvwarninglogfile' && doc.notificationstatus == 'none')
  emit([doc.date_valid['year'], doc.date_valid['month'], doc.date_valid['day'], doc.date_valid['hour'], doc.date_valid['minute'], doc.date_valid['second']], 1);
}