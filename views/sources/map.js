function(doc) {
    if(doc.type == "automat_data" && doc.ipaddr == "134.158.176.112") {
    
        emit( [doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'], doc.date['second']], {utctime:doc["utctime"], Co_France:doc["Co_France"], Co_Italie:doc["Co_Italie"], Ba_grotte:doc["Ba_grotte"], Ba_nemo:doc["Ba_nemo"]});
        
    }
}
