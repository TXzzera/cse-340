'use strict'

//Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList")
classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value
    console.log(`classification_id is: ${classification_id}`)
    let classIdURL = "/inv/getInventory/" + classification_id
    fetch(classIdURL)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw Error("Network response was not OK.");
        })
        .then(function (data) {
            console.log(data);
            buildInventoryList(data);
        })
        .catch(function (error) {
        console.log("There was a problem:", error.message)
    })
})

function buildInventoryList(data) {
    let inventoryDisplay = document.getElementById("inventoryDisplay");

    // Table header
    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
    dataTable += '</thead>';

    // Table body
    dataTable += '<tbody>';

    data.forEach(function (element) {
        dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;

        // Edit button
        dataTable += `<td>
                        <a href="/inv/edit/${element.inv_id}" title="Click to edit vehicle">Edit</a>
                      </td>`;

        // Delete button
        dataTable += `<td>
                        <a href="/inv/delete/${element.inv_id}" title="Click to delete vehicle">Delete</a>
                      </td></tr>`;
    });

    dataTable += '</tbody>';

    inventoryDisplay.innerHTML = dataTable;
}
