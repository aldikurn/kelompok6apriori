window.data = null;

// window.onbeforeunload = function(e) {
//     return 'Dialog text here.';
//  };

fetch('data.json')
  .then(response => response.json())
  .then(data => {
      window.data = data;
      refreshData();
  });

document.getElementById('import').addEventListener('click', function(e) {
    let files = document.getElementById('import-input').files;
    if (files.length <= 0) {
        return false;
    }

    let fileReader = new FileReader();
    fileReader.onload = function(e) { 
        window.data = JSON.parse(e.target.result);
    }
    fileReader.readAsText(files.item(0));
});

function refreshData() {
    refreshDataRule();
    refreshDataitem();
    refreshDataTransaction();
    refreshItemset1();
    refreshItemset2();
    refreshItemset3();
}

function getIndex(id, array) {
    return array.findIndex(x => x.id === id);
}

function showToast(message) {
    document.getElementById('toastMessage').textContent = message;
    $('#toastNotification').toast('show');
}

function getTotalTransaction(itemsId) {
    let count = 0;
    window.data.transactions.forEach(element => {
        let found = true;
        for(i = 0; i < itemsId.length; i++) {
            if(!element.itemsId.includes(itemsId[i])) {
                found = false;
                break;
            }
        }
        if(found) {
            count++;
        }
    });
    return count;
}

// Rule
let selectedRuleID = null;
let ruleEditForm = document.forms['ruleEditForm'];

function refreshDataRule() {
    // document.getElementById('totalRule').textContent = window.data.rules.length; badge total rule
    const tbody = document.getElementById('rules-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";
    window.data.rules.forEach(element => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${element.id}
            </td>
            <td>
                ${element.name}
            </td>
            <td>
                ${element.minimumSupport}%
            </td>
            <td>
                <button onclick="editRule('${element.id}')" class="btn btn-sm btn-outline-info">Edit</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editRule(id) {
    selectedRuleID = id;
    index = getIndex(selectedRuleID, window.data.rules);

    ruleEditForm['idInput'].value = window.data.rules[index].id;
    ruleEditForm['nameInput'].value = window.data.rules[index].name;
    ruleEditForm['minimumSupportInput'].value = window.data.rules[index].minimumSupport;

    $('#ruleEditModal').modal('show');
}

document.querySelector('#ruleEditModal .saveButton').addEventListener('click', function(event) {
    index = getIndex(selectedRuleID, window.data.rules);

    window.data.rules[index].id = ruleEditForm['idInput'].value;
    window.data.rules[index].name = ruleEditForm['nameInput'].value;
    window.data.rules[index].minimumSupport = parseInt(ruleEditForm['minimumSupportInput'].value);

    $('#ruleEditModal').modal('hide');
    showToast('Berhasil mengubah rule');
    refreshData();
});


// Data Barang
let selectedItemID = null;
let itemEditForm = document.forms['itemEditForm'];

function refreshDataitem() {
    document.getElementById('totalItems').textContent = window.data.items.length;
    const tbody = document.getElementById('items-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";
    window.data.items.forEach(element => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${element.id}
            </td>
            <td>
                ${element.name}
            </td>
            <td>
                <button onclick="editItem('${element.id}')" class="btn btn-sm btn-outline-info">Edit</button>
                <button onclick="deleteItem('${element.id}')" class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('showAddItemModalButton').addEventListener('click', function(event) {
    if(window.data.items.length > 0) {
        const lastID = window.data.items.slice(-1)[0].id;
        document.forms['itemAddForm']['idInput'].value = 'A' + (parseInt(lastID.substring(1)) + 1);
    } else {
        document.forms['itemAddForm']['idInput'].value = 'A1';
    }
    $('#itemAddModal').modal('show');
});

document.querySelector('#itemAddModal .saveButton').addEventListener('click', function(event) {
    const form = document.forms['itemAddForm'];

    if(form['idInput'].value === '' || form['nameInput'].value === '') {
        showToast('Data tidak lengkap');
        return;
    }

    const newData = {
        id : form['idInput'].value,
        name : form['nameInput'].value
    };

    window.data.items.push(newData);

    $('#itemAddModal').modal('hide');
    showToast('Berhasil menambahkan barang');
    refreshData();
});

function editItem(id) {
    selectedItemID = id;
    index = getIndex(selectedItemID, window.data.items);

    itemEditForm['idInput'].value = window.data.items[index].id;
    itemEditForm['nameInput'].value = window.data.items[index].name;

    $('#itemEditModal').modal('show');
}

document.querySelector('#itemEditModal .saveButton').addEventListener('click', function(event) {
    index = getIndex(selectedItemID, window.data.items);

    const form = document.forms['itemEditForm'];
    if(form['idInput'].value === '' || form['nameInput'].value === '') {
        showToast('Data tidak lengkap');
        return;
    }

    window.data.items[index].id = itemEditForm['idInput'].value;
    window.data.items[index].name = itemEditForm['nameInput'].value;

    $('#itemEditModal').modal('hide');
    showToast('Berhasil mengubah barang');
    refreshData();
});

function deleteItem(id) {
    selectedItemID = id;
    index = getIndex(selectedItemID, window.data.items);
    document.getElementById('itemNameToDelete').textContent = window.data.items[index].name;
    $('#itemDeleteModal').modal('show');
}

document.querySelector('#itemDeleteModal .deleteButton').addEventListener('click', function(event) {
    index = getIndex(selectedItemID, window.data.items);
    window.data.items.splice(index, 1);

    $('#itemDeleteModal').modal('hide');
    showToast('Berhasil menghapus barang');
    refreshData();
});



// Transaksi
let selectedTransactionID = null;

function refreshDataTransaction() {
    document.getElementById('totalTransaction').textContent = window.data.transactions.length;
    const tbody = document.getElementById('transactions-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";
    window.data.transactions.forEach(element => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${element.id}
            </td>
            <td>
                ${element.itemsId}
            </td>
            <td>
                <button onclick="editTransaction('${element.id}')" class="btn btn-sm btn-outline-info">Edit</button>
                <button onclick="deleteTransaction('${element.id}')" class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('showAddTransactionModalButton').addEventListener('click', function(event) {
    if(window.data.transactions.length > 0) {
        const lastID = window.data.transactions.slice(-1)[0].id;
        document.forms['transactionAddForm']['idInput'].value = 'T' + (parseInt(lastID.substring(1)) + 1);
    } else {
        document.forms['transactionAddForm']['idInput'].value = 'T1';
    }

    const itemCheckbox = document.querySelector('#transactionAddForm .itemsCheckbox');
    itemCheckbox.innerHTML = '';
    window.data.items.forEach(element => {
        const checkbox = document.createElement('div');
        checkbox.classList.add('form-check', 'form-check-inline');
        checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${element.id}" id="checkbox${element.id}">
            <label class="form-check-label" for="checkbox${element.id}">${element.name}</label>
        `;
        itemCheckbox.appendChild(checkbox);
    });
    $('#transactionAddModal').modal('show');
});

document.querySelector('#transactionAddModal .saveButton').addEventListener('click', function(event) {
    const form = document.forms['transactionAddForm'];
    const listItemsCheckbox = document.querySelectorAll('#transactionAddForm .itemsCheckbox input[type=checkbox]');

    let isValid = false;
    if(form['idInput'].value === '') {
        isValid = false;
        showToast('Data tidak lengkap');
        return;
    }
    listItemsCheckbox.forEach(element => {
        if(element.checked) {
            isValid = true;
        }
    });
    if(!isValid) {
        showToast('Data tidak lengkap');
        return;
    }

    const newData = {
        id : form['idInput'].value,
        itemsId : []
    };

    listItemsCheckbox.forEach(element => {
        if(element.checked) {
            newData.itemsId.push(element.value);
        } 
    });

    window.data.transactions.push(newData);

    $('#transactionAddModal').modal('hide');
    showToast('Berhasil menambahkan transaksi');
    refreshData();
});

function editTransaction(id) {
    const itemCheckbox = document.querySelector('#transactionEditForm .itemsCheckbox');
    itemCheckbox.innerHTML = '';
    window.data.items.forEach(element => {
        const checkbox = document.createElement('div');
        checkbox.classList.add('form-check', 'form-check-inline');
        checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${element.id}" id="checkbox${element.id}">
            <label class="form-check-label" for="checkbox${element.id}">${element.name}</label>
        `;
        itemCheckbox.appendChild(checkbox);
    });

    selectedTransactionID = id;
    const index = getIndex(selectedTransactionID, window.data.transactions);

    const form = document.forms['transactionEditForm'];
    form['idInput'].value = window.data.transactions[index].id;

    window.data.transactions[index].itemsId.forEach(v => {
        document.querySelector('#transactionEditForm #checkbox' + v).checked = true;
    });

    $('#transactionEditModal').modal('show');
}

document.querySelector('#transactionEditModal .saveButton').addEventListener('click', function(event) {
    const form = document.forms['transactionEditForm'];
    const listItemsCheckbox = document.querySelectorAll('#transactionEditForm .itemsCheckbox input[type=checkbox]');

    let isValid = false;
    if(form['idInput'].value === '') {
        isValid = false;
        showToast('Data tidak lengkap');
        return;
    }
    listItemsCheckbox.forEach(element => {
        if(element.checked) {
            isValid = true;
        }
    });
    if(!isValid) {
        showToast('Data tidak lengkap');
        return;
    }

    const itemsId  = [];
    listItemsCheckbox.forEach(element => {
        if(element.checked) {
            itemsId.push(element.value);
        }
    });

    const index = getIndex(selectedTransactionID, window.data.transactions);

    window.data.transactions[index].id = form['idInput'].value;
    window.data.transactions[index].itemsId = itemsId;

    $('#transactionEditModal').modal('hide');
    showToast('Berhasil mengubah transaksi');
    refreshData();
});

function deleteTransaction(id) {
    selectedTransactionID = id;
    document.getElementById('transactionIDToDelete').textContent = selectedTransactionID;
    $('#transactionDeleteModal').modal('show');
}

document.querySelector('#transactionDeleteModal .deleteButton').addEventListener('click', function(event) {
    index = getIndex(selectedTransactionID, window.data.transactions);
    window.data.transactions.splice(index, 1);

    $('#transactionDeleteModal').modal('hide');
    showToast('Berhasil menghapus transaksi');
    refreshData();
});

function getItemset1() {
    let allItemset1 = [];
    let selectedItemset1 = [];

    window.data.items.forEach(element => {
        let tempTotalTransaction = getTotalTransaction([element.id]);
        let tempSupport = parseInt(tempTotalTransaction / window.data.transactions.length * 100);

        let obj = {
            ids : [element.id],
            totalTransaction : tempTotalTransaction,
            support : tempSupport
        }
        
        allItemset1.push(obj);
        if(tempSupport >= window.data.rules[0].minimumSupport) {
            selectedItemset1.push(obj);
        }
    });

    return {
        all : allItemset1,
        selected : selectedItemset1
    };
}

// // v-pills-itemset-1-3
let itemsetNavPills = document.querySelectorAll('#hitung-apriori .nav-link');
itemsetNavPills.forEach(element => {
    element.addEventListener('click', function(event) {
        itemsetNavPills.forEach(v => {
            v.getElementsByClassName('badge')[0].classList.remove('badge-light');
            v.getElementsByClassName('badge')[0].classList.add('badge-primary');
        });

        element.getElementsByClassName('badge')[0].classList.remove('badge-primary');
        element.getElementsByClassName('badge')[0].classList.add('badge-light');
    });
});

// Itemset 1
let itemset = null;
function refreshItemset1() {
    itemset1 = getItemset1();

    document.getElementById('itemset1AllCombination').textContent = itemset1.all.length;
    document.getElementById('itemset1SelectedCombination').textContent = itemset1.selected.length;
    document.getElementById('itemset1MinimumSupportLabel').textContent = window.data.rules[0].minimumSupport + '%';

    const tbody = document.getElementById('itemset1-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";

    let data = null;
    if(document.getElementById('itemset1MinimumSupportFilter').checked) {
        data = itemset1.selected;
    } else {
        data = itemset1.all;
    }

    let number = 0;
    data.forEach(v => {
        number++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${number}
            </td>
            <td>
                ${v.ids}
            </td>
            <td>
                ${v.totalTransaction}
            </td>
            <td>
                ${v.support}%
            </td>
        `;
        if(v.support >= window.data.rules[0].minimumSupport) {
            tr.classList.add('bg-success', 'text-white');
        }
        tbody.appendChild(tr);
    });
}

document.getElementById('itemset1MinimumSupportFilter').addEventListener('change', function(event) {
    refreshItemset1();
});

// Itemset 2
function getItemset2() {
    let allItemset2 = [];
    let selectedItemset2 = [];

    // for(i = 0; i < itemset1.selected.length; i++) {
    //     for(j = window.data.items.findIndex(x => x.id === itemset1.selected[i].ids[0]) + 1; i < window.data.items.length; j++) {
    //         let tempIds = itemset1.selected[i].ids.slice(0);
    //         tempIds.push(window.data.items[j].id);
    //         let tempTotalTransaction = getTotalTransaction([itemset1.selected[i].ids[0], window.data.items[j].id]);
    //         let tempSupport = tempTotalTransaction / window.data.transactions.length * 100;

    //         let obj = {
    //             ids : tempIds,
    //             totalTransaction : tempTotalTransaction,
    //             support : tempSupport
    //         }

    //         allItemset2.push(obj);
    //         if(tempSupport >= window.data.rules[1].minimumSupport) {
    //             selectedItemset2.push(obj);
    //         }
    //     }
    // }

    itemset1.selected.forEach(val1 => {
        window.data.items.forEach(val2 => {
            if(val1.ids[0] !== val2.id) {
                let tempIds = val1.ids.slice(0);
                tempIds.push(val2.id);
                let tempTotalTransaction = getTotalTransaction([val1.ids[0], val2.id]);
                let tempSupport = tempTotalTransaction / window.data.transactions.length * 100;

                let obj = {
                    ids : tempIds,
                    totalTransaction : tempTotalTransaction,
                    support : tempSupport
                }

                allItemset2.push(obj);
                if(tempSupport >= window.data.rules[1].minimumSupport) {
                    selectedItemset2.push(obj);
                }
            }
        })
    });

    return {
        all : allItemset2,
        selected : selectedItemset2
    };
}

let itemset2 = null;
function refreshItemset2() {
    itemset2 = getItemset2();

    document.getElementById('itemset2AllCombination').textContent = itemset2.all.length;
    document.getElementById('itemset2SelectedCombination').textContent = itemset2.selected.length;
    document.getElementById('itemset2MinimumSupportLabel').textContent = window.data.rules[1].minimumSupport + '%';
    
    const tbody = document.getElementById('itemset2-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";
    
    let data = null;
    if(document.getElementById('itemset2MinimumSupportFilter').checked) {
        data = itemset2.selected;
    } else {
        data = itemset2.all;
    }

    let number = 0;
    data.forEach(v => {
        number++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${number}
            </td>
            <td>
                ${v.ids}
            </td>
            <td>
                ${v.totalTransaction}
            </td>
            <td>
                ${v.support}%
            </td>
        `;
        if(v.support >= window.data.rules[1].minimumSupport) {
            tr.classList.add('bg-success', 'text-white');
        }
        tbody.appendChild(tr);
    });
}

document.getElementById('itemset2MinimumSupportFilter').addEventListener('change', function(event) {
    refreshItemset2();
});

// Itemset 3
function getItemset3() {
    let allItemset3 = [];
    let selectedItemset3 = [];

    itemset2.selected.forEach(val1 => {
        window.data.items.forEach(val2 => {
            if(!val1.ids.includes(val2.id)) {
                let tempIds = val1.ids.slice(0);
                tempIds.push(val2.id);
                let tempTotalTransaction = getTotalTransaction([val1.ids[0], val2.id]);
                let tempSupport = tempTotalTransaction / window.data.transactions.length * 100;

                let obj = {
                    ids : tempIds,
                    totalTransaction : tempTotalTransaction,
                    support : tempSupport
                }

                allItemset3.push(obj);
                if(tempSupport >= window.data.rules[2].minimumSupport) {
                    selectedItemset3.push(obj);
                }
            }
        })
    });

    return {
        all : allItemset3,
        selected : selectedItemset3
    };
}

function refreshItemset3() {
    itemset3 = getItemset3();

    document.getElementById('itemset3AllCombination').textContent = itemset3.all.length;
    document.getElementById('itemset3SelectedCombination').textContent = itemset3.selected.length;
    document.getElementById('itemset3MinimumSupportLabel').textContent = window.data.rules[2].minimumSupport + '%';

    const tbody = document.getElementById('itemset3-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";
    
    let data = null;
    if(document.getElementById('itemset3MinimumSupportFilter').checked) {
        data = itemset3.selected;
    } else {
        data = itemset3.all;
    }

    data.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${v.ids}
            </td>
            <td>
                ${v.totalTransaction}
            </td>
            <td>
                ${v.support}%
            </td>
        `;
        if(v.support >= window.data.rules[2].minimumSupport) {
            tr.classList.add('bg-success', 'text-white');
        }
        tbody.appendChild(tr);
    });
}

document.getElementById('itemset3MinimumSupportFilter').addEventListener('change', function(event) {
    refreshItemset3();
});

let importedData = null;
document.getElementById('import').addEventListener('change', function(event) {
    let fileReader = new FileReader();
    fileReader.onload = function(eventReader) {
        let obj = JSON.parse(eventReader.target.result);
        importedData = obj;
    };
    fileReader.readAsText(event.target.files[0]);

});

document.getElementById('loadImport').addEventListener('click', function(event) {
    if(document.getElementById("import").files.length == 0 ){
        showToast('File tidak ada');
        return;
    }

    data = importedData;
    showToast('Berhasil mengimport data');
    refreshData();
});

document.getElementById('export').addEventListener('click', function(event){
    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.data));
    let a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute("href", data);
    a.setAttribute("download", "data.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
});

document.getElementById('reset').addEventListener('click', function(event) {
    window.data.items = [];
    window.data.transactions = [];

    showToast('Berhasil mereset data');

    refreshData();
});