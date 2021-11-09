let phoneNumbersArray = [
    {"name": "Арман", "phone": "1308", "baseInfo": "Коллега"}, {"name": "Сталбек", "phone": "1216", "baseInfo": "Коллега"},
    {"name": "Баглан", "phone": "3191", "baseInfo": "Коллега"}, {"name": "Канат", "phone": "1228", "baseInfo": "Коллега"},
    {"name": "Назым", "phone": "", "baseInfo": "Заказчик"}, {"name": "Александра", "phone": "", "baseInfo": "Jusan HR"},
];

function addCssAttr(tTable) {
    tTable.css({"text-align": "left"});
}

function generateTable() {
    let tTable = $("#phone_numbers");
    let tBody = $("<tbody>");

    console.log(tTable);
    for (let i = 0; i < phoneNumbersArray.length; i++) {
        let val = phoneNumbersArray[i];
        let tr = $("<tr>");
        let td = $("<td>");
        td.text(val.name);
        tr.append(td);

        td = $("<td>");
        td.text(val.phone);
        tr.append(td);

        td = $("<td>");
        td.text(val.baseInfo);
        tr.append(td);

        tBody.append(tr);
    }
    addCssAttr(tTable);
    tTable.append(tBody);
}

function waitTillTableExists() {
    if ($("#phone_numbers").length) {
        generateTable()
    } else {
        setTimeout(waitTillTableExists, 100);
    }
}

waitTillTableExists();