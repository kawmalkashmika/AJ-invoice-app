var invoice = {
  // (PART A) PROPERTIES
  hNum : null,   // html invoice number
  hDate : null,  // html invoice date
  hBill : null,  // html bill to
  hItems : null, // html items list
  hAdd : null,   // html add item row
  hData : null,  // html items datalist
  hTotal : null, // html total amount
  hLoad : null,  // html load invoice

  // (PART B) INIT ITEMS LIST
  init : () => {
    // (B1) GET HTML ELEMENTS
    invoice.hNum = document.getElementById("inNum");
    invoice.hDate = document.getElementById("inDate");
    invoice.hBill = document.getElementById("inBill");
    invoice.hItems = document.getElementById("itemsList");
    invoice.hAdd = document.getElementById("itemsAdd");
    invoice.hData = document.getElementById("itemsData");
    invoice.hTotal = document.getElementById("totals");
    invoice.hLoad = document.querySelector("#loader input[type=file]");

    // (B2) POPULATE ITEMS DATALIST
    for (let i of Object.keys(items)) {
      let row = document.createElement("option")
      row.value = i;
      invoice.hData.appendChild(row);
    }
  },

  // (PART C) SET PRICE EACH (WHEN CHOOSING ITEM)
  price : item => { if (items[item.value]) {
    item.nextElementSibling.value = items[item.value];
  }},

  // （PART D）ADD ITEM
  add : calc => {
    // (D1) CLONE NEW ITEM ROW
    let row = invoice.hAdd.cloneNode(true),
        qty = row.querySelector(".qty"),
        item = row.querySelector(".item"),
        price = row.querySelector(".price"),
        act = row.querySelector(".action");
    row.removeAttribute("id");
    qty.required = true;
    qty.setAttribute("onchange", "invoice.total()");
    item.required = true;
    price.required = true;
    price.setAttribute("onchange", "invoice.total()");
    act.value = "X";
    act.setAttribute("onclick", "invoice.remove(this.parentElement)");
    document.getElementById("itemsList").appendChild(row);

    // (D2) RESET ADD ITEM
    for (let i of invoice.hAdd.querySelectorAll("input:not(.action)")) {
      i.value = "";
    }

    // (D3) CALCULATE TOTAL
    if (calc) { invoice.total(); }
  },

  // (PART E) REMOVE ITEM
  remove : row => {
    row.remove();
    invoice.total();
  },

  // (PART F) CALCULATE TOTAL
  total : () => {
    let total = 0;
    for (let row of invoice.hItems.querySelectorAll(".irow")) {
      let qty = parseInt(row.querySelector(".qty").value),
          price = parseFloat(row.querySelector(".price").value);
      if (isNaN(qty) || isNaN(price)) { continue; }
      total += qty * price;
    }
    invoice.hTotal.innerHTML = "Grand Total: $" + total.toFixed(2);
  },

  // (PART G) SAVE INVOICE
  save : () => {
    // (G1) GET INVOICE DATA
    let data = {};
    data.num = invoice.hNum.value;
    data.date = invoice.hDate.value;
    data.bill = invoice.hBill.value;
    data.items = [];
    for (let row of invoice.hItems.querySelectorAll(".irow")) {
      let item = [];
      for (let i of row.querySelectorAll("input:not(.action)")) {
        item.push(i.value);
      }
      data.items.push(item);
    }

    // (G2) CONSTRUCT BLOB & "FORCE DOWNLOAD"
    let url = window.URL.createObjectURL(
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );
    let a = document.createElement("a");
    a.href = url;
    a.download = "invoice.json";
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // (PART H) LOAD INVOICE
  load : () => {
    // (H1) FILE READER
    const reader = new FileReader();

    // (H2) DRAW INVOICE
    reader.onload = e => {
      invoice.hLoad.value = "";
      try {
        let data = JSON.parse(reader.result);
        invoice.hNum.value = data.num;
        invoice.hDate.value = data.date;
        invoice.hBill.value = data.bill;
        invoice.hItems.innerHTML = "";
        for (let row of data.items) {
          invoice.hAdd.querySelector(".qty").value = row[0];
          invoice.hAdd.querySelector(".item").value = row[1];
          invoice.hAdd.querySelector(".price").value = row[2];
          invoice.add();
        }
        invoice.total();
      } catch (e) {
        alert("Error loading file");
        console.error(e);
      }
    };

    // (H3) ERROR READING
    reader.onerror = e => {
      alert("Error loading file");
      console.error(e);
    };

    // (H4) GO!
    reader.readAsText(invoice.hLoad.files[0]);
  },
  
  // (PART I) PRINT INVOICE
  print : () => {
    // (I1) CHECK FOR ITEMS
    if (invoice.hItems.querySelectorAll(".irow").length==0) {
      alert("Please add at least one item.");
      return false;
    }

    // (I2) OPEN PRINT PAGE
    let page = window.open("print.html");
    page.onload = () => {
      // (I2-1) INVOICE
      page.document.getElementById("billto").innerHTML = "<strong>BILL TO:</strong><br>" + invoice.hBill.value.replace(/\n/g, "<br>");
      page.document.getElementById("inNum").innerHTML = "<strong>INVOICE #: </strong>" + invoice.hNum.value;
      page.document.getElementById("inDate").innerHTML = "<strong>DATE: </strong>" + invoice.hDate.value;

      // (I2-2) ITEMS
      for (let row of invoice.hItems.querySelectorAll(".irow")) {
        let clone = row.cloneNode(true);
        clone.querySelector(".action").remove();
        for (let i of clone.querySelectorAll("input")) { i.readOnly = true; }
        page.document.getElementById("items").appendChild(clone);
      }

      // (I2-3) TOTALS
      page.document.getElementById("totals").innerHTML = invoice.hTotal.innerHTML;

      // (I2-4) PRINT INVOICE
      page.print();
    };
    return false;
  }
};

// (PART J) START
window.addEventListener("load", invoice.init);