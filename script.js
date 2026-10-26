window.onload = function () {
  renderSavedGridsList();
};

function formatCommas(num) {
  if (isNaN(num) || num === null) return "0.00";
  let parts = num.toFixed(2).split(".");
  parts[0] = Number(parts[0]).toLocaleString('en-US');
  return parts.join(".");
}

function formatNumber(input) {
  let value = input.value.replace(/[^\d.]/g, '');
  let parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  if (value === '') {
    input.value = '';
    return;
  }

  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  if (integerPart !== '') {
    integerPart = Number(integerPart).toLocaleString('en-US');
  }

  input.value = integerPart + decimalPart;
}

// Dual Input Lock & Prompt Logic
function handleDualPriceInput(inputElem, type) {
  formatNumber(inputElem);

  let row = inputElem.closest("tr");
  let localElem = row.querySelector(".local-Price");
  let usdElem = row.querySelector(".usd-Price");

  if (type === 'local') {
    if (inputElem.value.trim() !== "") {
      usdElem.classList.add("locked-input");
      usdElem.value = "";
    } else {
      usdElem.classList.remove("locked-input");
    }
  } else if (type === 'usd') {
    if (inputElem.value.trim() !== "") {
      localElem.classList.add("locked-input");
      localElem.value = "";
    } else {
      localElem.classList.remove("locked-input");
    }
  }
}

function checkIfLocked(inputElem, type) {
  let row = inputElem.closest("tr");
  let localElem = row.querySelector(".local-Price");
  let usdElem = row.querySelector(".usd-Price");

  if (type === 'local' && usdElem.value.trim() !== "") {
    inputElem.blur();
    alert("يرجى تفريغ الحقل الآخر أولاً لتتمكن من كتابة السعر هنا!");
  } else if (type === 'usd' && localElem.value.trim() !== "") {
    inputElem.blur();
    alert("يرجى تفريغ الحقل الآخر أولاً لتتمكن من كتابة السعر هنا!");
  }
}

function addRow() {
  let tbody = document.getElementById("itemRows");

  let newRow = document.createElement("tr");
  newRow.innerHTML = `
            <td>
              <input type="text" class="item-input" placeholder="اسم المادة" />
            </td>
            <td><input type="text" inputmode="decimal" class="item-input qty" value="1" oninput="formatNumber(this)" /></td>
            <td>
              <input
                type="text"
                inputmode="decimal"
                class="item-input local-Price"
                placeholder="محلي"
                oninput="handleDualPriceInput(this, 'local')"
                onfocus="checkIfLocked(this, 'local')"
              />
            </td>
            <td>
              <input
                type="text"
                inputmode="decimal"
                class="item-input usd-Price"
                placeholder="دولار"
                oninput="handleDualPriceInput(this, 'usd')"
                onfocus="checkIfLocked(this, 'usd')"
              />
            </td>
            <td><button class="danger" onclick="removeRow(this)">X</button></td>
    `;

  tbody.appendChild(newRow);
}

function clearAll() {
  document.getElementById("exchangeRate").value = "";
  document.getElementById("gridNameInput").value = "";

  let tbody = document.getElementById("itemRows");
  tbody.innerHTML = `
        <tr>
            <td>
                <input type="text" class="item-input" placeholder="اسم المادة" />
            </td>
            <td><input type="text" inputmode="decimal" class="item-input qty" value="1" oninput="formatNumber(this)" /></td>
            <td>
              <input
                type="text"
                inputmode="decimal"
                class="item-input local-Price"
                placeholder="محلي"
                oninput="handleDualPriceInput(this, 'local')"
                onfocus="checkIfLocked(this, 'local')"
              />
            </td>
            <td>
              <input
                type="text"
                inputmode="decimal"
                class="item-input usd-Price"
                placeholder="دولار"
                oninput="handleDualPriceInput(this, 'usd')"
                onfocus="checkIfLocked(this, 'usd')"
              />
            </td>
            <td><button class="danger" onclick="removeRow(this)">X</button></td>
         </tr>
    `;

  document.getElementById("resultContainer").innerHTML = '<p class="placeholder-text">اضغط على "عرض النتائج" لإظهار الحسابات هنا</p>';
}

function removeRow(button) {
  let row = button.parentElement.parentElement;

  if (document.getElementById("itemRows").children.length > 1) {
    row.remove();
    let exchangeRate = parseFloat(document.getElementById("exchangeRate").value.replace(/,/g, ''));
    if (exchangeRate > 0) {
      calculateResults();
    }
  }
}

// --- SAVING & LOADING GRIDS SYSTEM ---

function saveCurrentGrid() {
  let gridName = document.getElementById("gridNameInput").value.trim();
  if (!gridName) {
    alert("الرجاء إدخال اسم للقائمة قبل الحفظ!");
    return;
  }

  let exchangeRate = document.getElementById("exchangeRate").value;
  let rows = document.getElementById("itemRows").rows;
  let itemsData = [];

  for (let i = 0; i < rows.length; i++) {
    let nameInput = rows[i].cells[0].querySelector("input");
    let qtyInput = rows[i].cells[1].querySelector("input");
    let localInputElem = rows[i].cells[2].querySelector("input");
    let usdInputElem = rows[i].cells[3].querySelector("input");

    if (!nameInput) continue;

    itemsData.push({
      name: nameInput.value,
      qty: qtyInput.value,
      localPrice: localInputElem.value,
      usdPrice: usdInputElem.value
    });
  }

  let gridData = {
    name: gridName,
    exchangeRate: exchangeRate,
    items: itemsData,
    date: new Date().toLocaleDateString()
  };

  let allGrids = JSON.parse(localStorage.getItem("storeCalcSavedGrids")) || {};
  allGrids[gridName] = gridData;
  localStorage.setItem("storeCalcSavedGrids", JSON.stringify(allGrids));

  downloadJSONBackup(gridName, gridData);
  renderSavedGridsList();
  alert("تم حفظ القائمة بنجاح وتحميل نسخة احتياطية!");
}

function renderSavedGridsList() {
  let listContainer = document.getElementById("savedGridsList");
  let allGrids = JSON.parse(localStorage.getItem("storeCalcSavedGrids")) || {};
  let keys = Object.keys(allGrids);

  if (keys.length === 0) {
    listContainer.innerHTML = '<span class="no-saved-text">لا توجد قوائم محفوظة بعد</span>';
    return;
  }

  let html = "";
  keys.forEach(key => {
    html += `<button class="saved-grid-chip" onclick="loadGrid('${key}')">${key}</button>`;
  });

  listContainer.innerHTML = html;
}

function loadGrid(gridName) {
  let allGrids = JSON.parse(localStorage.getItem("storeCalcSavedGrids")) || {};
  let gridData = allGrids[gridName];

  if (!gridData) {
    alert("لم يتم العثور على القائمة!");
    return;
  }

  document.getElementById("gridNameInput").value = gridData.name;
  document.getElementById("exchangeRate").value = gridData.exchangeRate || "";

  let tbody = document.getElementById("itemRows");
  tbody.innerHTML = "";

  gridData.items.forEach(item => {
    let newRow = document.createElement("tr");

    // Determine which field has a value to apply visual locking correctly upon load
    let hasLocal = item.localPrice && item.localPrice.trim() !== "";
    let hasUsd = item.usdPrice && item.usdPrice.trim() !== "";

    newRow.innerHTML = `
      <td><input type="text" class="item-input" value="${item.name || ''}" placeholder="اسم المادة" /></td>
      <td><input type="text" inputmode="decimal" class="item-input qty" value="${item.qty || '1'}" oninput="formatNumber(this)" /></td>
      <td>
        <input type="text" inputmode="decimal" class="item-input local-Price ${hasUsd ? 'locked-input' : ''}" value="${item.localPrice || ''}" placeholder="محلي" oninput="handleDualPriceInput(this, 'local')" onfocus="checkIfLocked(this, 'local')" />
      </td>
      <td>
        <input type="text" inputmode="decimal" class="item-input usd-Price ${hasLocal ? 'locked-input' : ''}" value="${item.usdPrice || ''}" placeholder="دولار" oninput="handleDualPriceInput(this, 'usd')" onfocus="checkIfLocked(this, 'usd')" />
      </td>
      <td><button class="danger" onclick="removeRow(this)">X</button></td>
    `;
    tbody.appendChild(newRow);
  });

  calculateResults();
}

function downloadJSONBackup(filename, dataObj) {
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
  let downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename + "_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importJSONBackup(event) {
  let file = event.target.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function (e) {
    try {
      let gridData = JSON.parse(e.target.result);
      if (!gridData.name || !gridData.items) {
        alert("ملف النسخة الاحتياطية غير صالح!");
        return;
      }

      let allGrids = JSON.parse(localStorage.getItem("storeCalcSavedGrids")) || {};
      allGrids[gridData.name] = gridData;
      localStorage.setItem("storeCalcSavedGrids", JSON.stringify(allGrids));

      renderSavedGridsList();
      loadGrid(gridData.name);
      alert(`تم استيراد القائمة "${gridData.name}" بنجاح!`);
    } catch (err) {
      alert("حدث خطأ أثناء قراءة ملف الـ JSON.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

// --- CALCULATION ENGINE ---

function calculateResults() {
  let rawRate = document.getElementById("exchangeRate").value.replace(/,/g, '');
  let exchangeRate = parseFloat(rawRate);

  if (!exchangeRate || exchangeRate <= 0) {
    alert("رجاء ادخل قيمة الدولار الحالية اولا!!");
    return;
  }

  let rows = document.getElementById("itemRows").rows;
  let totalLocal = 0;
  let totalUsd = 0;

  let resultHTML = '<h3 class="result-title">نتائج الحساب التفصيلية</h3>';

  for (let i = 0; i < rows.length; i++) {
    let nameInput = rows[i].cells[0].querySelector("input");
    let qtyInput = rows[i].cells[1].querySelector("input");
    let localInputElem = rows[i].cells[2].querySelector("input");
    let usdInputElem = rows[i].cells[3].querySelector("input");

    if (!nameInput || !qtyInput || !localInputElem || !usdInputElem) continue;

    let name = nameInput.value || "مادة بدون اسم";
    let qty = parseFloat(qtyInput.value.replace(/,/g, '')) || 0;
    let localInput = parseFloat(localInputElem.value.replace(/,/g, ''));
    let usdInput = parseFloat(usdInputElem.value.replace(/,/g, ''));

    let itemTotalLocal = 0;
    let itemTotalUsd = 0;

    if (!isNaN(localInput) && isNaN(usdInput)) {
      itemTotalLocal = localInput * qty;
      itemTotalUsd = itemTotalLocal / exchangeRate;
    } else if (isNaN(localInput) && !isNaN(usdInput)) {
      itemTotalUsd = usdInput * qty;
      itemTotalLocal = itemTotalUsd * exchangeRate;
    } else if (!isNaN(localInput) && !isNaN(usdInput)) {
      itemTotalLocal = localInput * qty;
      itemTotalUsd = itemTotalLocal / exchangeRate;
    }

    totalLocal += itemTotalLocal;
    totalUsd += itemTotalUsd;

    let unitLocal = qty > 0 ? itemTotalLocal / qty : 0;
    let unitUsd = qty > 0 ? itemTotalUsd / qty : 0;

    resultHTML += `
      <div class="result-row-card">
        <div class="result-item-name">📦 ${name}  --  <span>الكمية (${qty.toLocaleString('en-US')})</span> </div>
        <div class="result-details">
          <span>الإفرادي محلي: ${formatCommas(unitLocal)}</span>
          <span>الإفرادي دولار: $${formatCommas(unitUsd)}</span>
        </div>
        <div class="result-row-totals">
          <span>المجموع المحلي: <strong>${formatCommas(itemTotalLocal)}</strong></span>
          <span>المجموع دولار: <strong>$${formatCommas(itemTotalUsd)}</strong></span>
        </div>
      </div>
    `;
  }

  resultHTML += `
    <div class="result-grand-total">
      <h4>المجموع الكلي النهائي</h4>
      <p>المحلي: ${formatCommas(totalLocal)}</p>
      <p>الدولار: $${formatCommas(totalUsd)}</p>
    </div>
  `;

  document.getElementById("resultContainer").innerHTML = resultHTML;
}
