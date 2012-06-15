function(doc) {
    if(doc.type == "automat_data" && doc.ipaddr == "134.158.176.112") {
      var cryoVal=['T_Bolo', 'P_regul', 'T_Speer', 'T_PT1', 'T_B1K', 'P_B1K',
                      'P_injection', 'debit', 'I_Alim1', 'I_Alim2',
                      'I_Alim3', 'I_Alim4', 'GM_P', 'PT_P', 'Pt_1',
                      'Pt_2', 'Pt_3', 'Hc1', 'Hc2', 'Hc3', 'Hc4'];
                      
       for (i in cryoVal) {
         emit([cryoVal[i], doc["utctime"]], doc[cryoVal[i]] );
       }
	   
    }
}
