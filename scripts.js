//account details 
const buisnessID = "eTC3QY5W3p_HmGHezKfxJw";
var username ="global/cloud@apiexamples.com"
var password ="VMlRo/eh+Xd8M~l"



var clients = [];
var selectedClient = [];
var authmessage = "Basic " + btoa(username + ':' + password); //Create Authentication hash 

$(document).ready(function () {

    $(".clientSearchButton").click(function () {
        //clear any populated client data and empty the client list
        clients = [];
        selectedClient = [];
        $("#clientSelect").empty();

        //get fresh client data from api then populate the client list and display the first results data
        $.when(getClients()).then(function(){ 
            popClientSelect();
            selectClient(function () {
                document.getElementById('clients').innerHTML = JSON.stringify(selectedClient, null, 2);
            });
        })
    });

    $(".voucherButton").click(function () {
        if (selectedClient.clientId != null) {
            createVoucher();
        } else {
            alert("Please select a client first");
            return false; 
        }
    });

    $("#clientSelect").change(function () {
        //clear any voucher details on display
        $("#voucherDis").empty();
        //when you select a new client show their data
        selectClient(function () {
            document.getElementById('clients').innerHTML = JSON.stringify(selectedClient, null, 2);
        });

    })
});



function getClients() {  
    //ajax call to get clients
  return $.ajax({
        dataType: "json",
        type: "GET",
      beforeSend: function (xhr) {
            //Basic auth header 
            xhr.setRequestHeader("Authorization", authmessage);
        },
      data: {
          size: $("#cAmount").val(),
          firstName: $("#cFirstName").val(),
          lastName:$("#cSurname").val()
        },
       url: "https://api-gateway-dev.phorest.com:443/third-party-api-server/api/business/" + buisnessID + "/client",
       dataFilter: result => JSON.stringify(JSON.parse(result)),
      success: function (result) {
            //make a local store of the returned clients for our use
            result._embedded.clients.forEach((clientID) => {
                clients.push(clientID);
            });            
        },
        error: (xhr, status, errorThrown) => false
    });
};

function createVoucher() {
    //Date for issuedate
    d = new Date();
    //ajax call to create voucher
    $.ajax({
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "POST",
        beforeSend: function (xhr) {
            //Basic auth header 
            xhr.setRequestHeader("Authorization", authmessage);
        },
        data: JSON.stringify({
            "clientId": selectedClient.clientId,
            "createdAt": d.toISOString(),
            "creatingBranchId": "SE-J0emUgQnya14mOGdQSw",
            "expiryDate": $("#vExpiry").val(),
            "issueDate": $("#vIssue").val(),
            "originalBalance": $("#vAmount").val(),
            "serialNumber": ""        
         }),
         url: "https://api-gateway-dev.phorest.com:443/third-party-api-server/api/business/" + buisnessID + "/voucher", 
        success: function (result) {    
            //alert(result);
            document.getElementById('voucherDis').innerHTML = JSON.stringify(result, null, 2);
            $("#clients").empty();//clear the client details
        },
        error: (xhr, status, errorThrown) => false
    });
};

function popClientSelect() {
    var target = document.getElementById("clientSelect");

    for (var i = 0; i < clients.length; i++) {
        var opt = clients[i];
        var el = document.createElement("option");
        el.textContent = opt.firstName+" "+opt.lastName;
        el.value = opt.clientId;
        target.appendChild(el);
    }
};

function selectClient(_callback) {
    //change the active client to the one matching the selected clientId from list
    selectedClient = clients.find(client => {
        return client.clientId === $("#clientSelect").val();
    });
    _callback();//callback so we can perform functions right after updating our selected client
}



window.onload = function () {
    var today = new Date().toISOString().split('T')[0];  
    //set issue date field default to current date
    $("#vIssue").val(today);
    //set expiry default to 6 months later
    var monthsLater = new Date(today);
    monthsLater.setMonth(monthsLater.getMonth() + 6);
    $("#vExpiry").val(monthsLater.toISOString().split('T')[0]);
}


