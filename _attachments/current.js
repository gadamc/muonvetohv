var db = $.couch.db(window.location.pathname.split("/")[1]);

var cryoVal=['T_Bolo', 'P_regul', 'T_Speer', 'T_PT1', 'T_B1K', 'P_B1K',
                'P_injection', 'debit', 'I_Alim1', 'I_Alim2',
                'I_Alim3', 'I_Alim4', 'GM_P', 'PT_P', 'Pt_1',
                'Pt_2', 'Pt_3', 'Hc1', 'Hc2', 'Hc3', 'Hc4', 'Co_France',
                'Co_Italie', 'Ba_grotte', 'Ba_nemo']; 

$(document).ready(function() {
    fillData();
});

function fillData()
{
    db.view("data/byipaddress",  {
        key:"134.158.176.112",
        reduce:false,
        descending:true,
        include_docs:true,
        limit:1,
        success:function(data){ 
            
            var doc = data.rows[0].doc;

            if (doc){
                
                addToStats(doc);
            }
            else{
                displayError();
            }
            
         },
         error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
         
    });
}

function addToStats(doc){
    var p = document.getElementById("title");
    var today = new Date(doc.utctime*1000.0)
    p.innerHTML = today.toUTCString();
    p.innerHTML += "<br><br>";
    
    var tbl = document.getElementById('data');
	var tblbody = tbl.getElementsByTagName("tbody");
	//clear the table in case its allready full of elements
	for(var i = 0; i < tblbody.length; i++){tbl.removeChild(tblbody[i]);}
	
	var tblbody = document.createElement("tbody");
	
    for (var i = 0; i <  cryoVal.length; i++) {

        if (doc.hasOwnProperty(cryoVal[i])) {
            var row = document.createElement("tr");
                
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode( cryoVal[i] ));
            row.appendChild(cell);
                
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode( doc[cryoVal[i]] ));
            row.appendChild(cell);
                
            tblbody.appendChild(row);
        }
    }
    tbl.appendChild(tblbody);
    
}

function displayError(){
    var p = document.getElementById("title");
    p.innerHTML = "<h1>Failed to get document from the database.</h1>";

}