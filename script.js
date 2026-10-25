function addRow() {
    let tbody = document.getElementById("itemRows")
    let showUsd = document.getElementById("usdHeader").style.display !== "none";

    let newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td>
              <input type="text" class="item-input" placeholder="اسم المادة" />
            </td>
            <td><input type="number" class="item-input qty" value="1" /></td>
            <td>
              <input
                type="number"
                class="item-input Price"
                placeholder="0.00"
              />
            </td>
            <td class="row-usd" style="display: ${showUsd ? '' : 'none'}">$0.00</td>
            <td><button class="danger" onclick="removeRow(this)">X</button></td>
    `;

    tbody.appendChild(newRow)
}
function clearAll() {
    document.getElementById("exchangeRate").value = "";

    let tbody = document.getElementById("itemRows");
    tbody.innerHTML = `
        <tr>
            <td>
                <input type="text" class="item-input" placeholder="اسم المادة" />
            </td>
            <td><input type="number" class="item-input qty" value="1" /></td>
            <td>
                <input
                    type="number"
                    class="item-input Price"
                    placeholder="0.00"
                />
            </td>
            <td class="row-usd" style="display: none">$0.00</td>
            <td><button class="danger" onclick="removeRow(this)">X</button></td>
         </tr>
    `
    document.getElementById("usdHeader").style.display = "none";

    document.getElementById("receiptBox").style.display = "none";
    document.getElementById("gridTotalBox").style.display = "none";

    document.getElementById("receiptList").innerHTML = "";

    document.getElementById("receiptGrandTotal").innerText = "المجموع : $0.00";
    document.getElementById("gridGrandTotal").innerText = "المجموع بالدولار : $0.00";


}
function removeRow(button) {
    let row = button.parentElement.parentElement;

    if (document.getElementById("itemRows").children.length > 1) {
        row.remove(row)
    }
}

function getCalculationData() {
    let rate = parseFloat(document.getElementById("exchangeRate").value) || 0;
    let rows = document.getElementById("itemRows").rows;
    let items = [];
    let totalUSD = 0;

    for (let i = 0; i < rows.length; i++) {
        let nameInput = rows[i].cells[0].children[0].value || "Unnamed item";
        let qty = parseFloat(rows[i].cells[1].children[0].value) || 0;
        let priceLocale = parseFloat(rows[i].cells[2].children[0].value) || 0;

        let itemTotalLocal = qty * priceLocale;
        let itemTotalUsd = rate > 0 ? itemTotalLocal / rate : 0;

        totalUSD += itemTotalUsd

        items.push({
            rowElement: rows[i],
            name: nameInput,
            qty: qty,
            usd: itemTotalUsd
        });
    }
    return { rate, items, totalUSD }
}

function processOption1() {
    let data = getCalculationData()
    if (data.rate <= 0) {
        alert("رجاء ادخل قيمة الدولار الحالية اولا!!");
        return
    }

    document.getElementById("usdHeader").style.display = "";
    for (let item of data.items) {
        item.rowElement.cells[3].style.display = "";
        item.rowElement.cells[3].innerText = "$" + item.usd.toFixed(2);
    }

    document.getElementById("receiptBox").style.display = "none";
    let gridBox = document.getElementById("gridTotalBox");
    gridBox.style.display = "block";
    document.getElementById("gridGrandTotal").innerText = "> المجموع بالدولار: $" + data.totalUSD.toFixed(2);
}

function processOption2() {
    let data = getCalculationData();
    if (data.rate <= 0) {
        alert("رجاء ادخل قيمة الدولار الحالية اولا!!");
        return;
    }

    document.getElementById("usdHeader").style.display = "none";
    for (let item of data.items) {
        item.rowElement.cells[3].style.display = "none";
    }
    document.getElementById("gridTotalBox").style.display = "none";

    let receiptListHtml = "";
    for (let item of data.items) {
        receiptListHtml += `
        <div class="receipt-item">
            <span>${item.name} (x${item.qty})</span>
            <span><strong>$${item.usd.toFixed(2)}</strong></span>
        </div>`
    }

    document.getElementById("receiptList").innerHTML = receiptListHtml;
    document.getElementById("receiptGrandTotal").innerText = "> المجموع: $" + data.totalUSD.toFixed(2);

    document.getElementById("receiptBox").style.display = "block";
}