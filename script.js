var rsAPI = "https://script.google.com/macros/s/AKfycbxqaLuBn2hKTGXQ-SSBbF-QXKCxohWXZSrvdCbTTgyQsstseStiMS79KuEGHOzn0tzt/exec";
var dbAPI = "https://script.google.com/macros/s/AKfycbzJ7VEzbytyyteypeYDzSdd0S-KDlR2N0lwYLS9GLmmmAjw85jA3DKbL1CDcNxFIzNt/exec"
var sendform = {
    userName : "",
    userAgent: ""
};
var globalVar = {};
    globalVar["staffData"] = []
    globalVar["unitData"] = []
    globalVar["hhData"] = []
    globalVar["uniqueObserver"] = []
var inputListCurrentFocus
var isOnline = window.navigator.onLine
var hhTableDivider = 10
var tableMinShow = {
    "hh": 0
}
var loginPass = true

function trial(){
    var data = globalVar["hhData"]
    tableMinShow.hh = 90
    UpdateHHTable(data.slice(data.length - 100))
}
document.querySelectorAll(".input-with-list").forEach((elem) => {
    elem.addEventListener('input', function(){
        filterInputList(elem.id, elem.value, elem.getAttribute("list-name"))
    })
    elem.addEventListener("keydown", function(e) {
        var list = document.getElementById(elem.getAttribute("list-name"));
        var x = []
        if (list) {
            x = list.querySelectorAll("li");
            x.forEach((p)=> p.classList.remove("listCurrActive"))
        }
        if (e.keyCode == 40 && inputListCurrentFocus < x.length-1) {
          inputListCurrentFocus++;
          addActive(x[inputListCurrentFocus]);
          if(inputListCurrentFocus>0){
            SlideTo(x[inputListCurrentFocus], x[inputListCurrentFocus].parentNode);
            }
        } else if (e.keyCode == 38 && inputListCurrentFocus > 0) { //up
          inputListCurrentFocus--;
          addActive(x[inputListCurrentFocus]);
          if(inputListCurrentFocus>0){
            SlideTo(x[inputListCurrentFocus], x[inputListCurrentFocus].parentNode);
            }
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (inputListCurrentFocus > -1) {
            if (x) x[inputListCurrentFocus].click();
          }
        }
        
    });
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
        NameInList(elem.id)
    });
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("input-list");
        for (var i = 0; i < x.length; i++) {
            // console.log(elmnt != x[i] && elmnt != elem)
          if (elmnt != x[i] && elmnt != elem) {
            Elem(elem.getAttribute("list-name")).innerHTML=""
          }
        }
    }
    function filterInputList(inputID, text, listTargetID){
        var listElem = Elem(listTargetID)
        listElem.innerHTML = ""
        var listTambah =  document.querySelector("#tambah-list-template > ul").cloneNode(true)
        if(!(Elem(inputID).classList.contains("no-list-add"))){var listTambah =  document.querySelector("#tambah-list-template > ul").cloneNode(true)}
        var filteredData = globalVar[listElem.getAttribute("list-data-to-filter")].filter((x) => x["name"].toString().toLowerCase().includes(text.toLowerCase()))
        if(text.length < 1){return false;}
        inputListCurrentFocus = -1
        if(text.length > 0){
            if(!(Elem(inputID).classList.contains("no-list-add"))){
                listElem.appendChild(listTambah)
                // LOG(listTambah); return
                document.querySelector("#" + listTargetID + " > ul > .tambah-list > span").innerHTML = text;
                document.querySelector("#" + listTargetID + " > ul > .tambah-list").setAttribute("onclick", listElem.getAttribute("tambah-list-function").replace("()","('"+text+"')"+"; document.getElementById('"+listElem.getAttribute("input-to-paste-id")+"').value = ''"))
            }
            else{var ulNew = document.createElement("ul");
                listElem.appendChild(ulNew);
                // console.log("filter")
            } 
            // return
            if(filteredData.length > 0){
                var ulNew = document.createElement("ul")
                listElem.appendChild(ulNew)
                for(var i = 0; i < filteredData.length; i++){
                    var liNew = document.createElement("li")
                    liNew.innerHTML = filteredData[i].name
                    var addFunc = ""
                    switch (listElem.getAttribute("list-data-to-filter")) {
                        case "staffData":
                            addFunc = "SelectStaffBase('"+ filteredData[i].baseGroup + "', '"+filteredData[i].baseUnit+"'); "
                            + "if(isInputValid('hh')){Elem('hh-score-container').style.display = 'flex'}" +
                            "else {Elem('hh-score-container').style.display = 'none'}";
                            break;
                        case "unitData":
                        
                            break;
                        default:
                            addFunc = ""
                    }
                    liNew.setAttribute("onclick", 
                        "Elem('"+inputID+"').value = '"+filteredData[i].name+"';" 
                        + "Elem('"+ listTargetID +"').innerHTML = ''; " 
                        + addFunc
                        )
                    ulNew.appendChild(liNew)
                }   
            }
        }
    }
})
document.querySelectorAll('.onchange-check').forEach((elem)=>{
    elem.addEventListener('change', function(){
        if(isInputValid("hh")){Elem("hh-score-container").style.display = "flex"}
        else {Elem("hh-score-container").style.display = "none"}
    })
})
function onload() {
    isOnline = false
    if(!(isOnline)){
        console.log("offline - state")
        globalVar["staffData"] = JSON.parse(localStorage.getItem("staffData"))
        globalVar["unitData"] = JSON.parse(localStorage.getItem("unitData"))
        globalVar["hhData"] = JSON.parse(localStorage.getItem("hhData"))
        ResetInput("all")
        if (loginPass){login("ipcn")}
        loader(false)
    }
    else {
        console.log("online - state")
        downloadDB()
    }
}
function Elem(id) {
    return document.getElementById(id)
}
function loader(bo) {
    if (bo){
        Elem("loader").style.display = "flex";
    } else if (!(bo)) { Elem("loader").style.display = "none" }
}
function Toast(text){
    var toastDiv = Elem('liveToast')
    toastDiv.querySelector(".toast-body").innerHTML = text
    const toast = new bootstrap.Toast(toastDiv)
    toast.show()
}
function login(text){
    sendform.userName = text
    sendform.userAgent = window.navigator.userAgent
    console.log("login as: "+sendform.userName)
    console.log("login with: "+sendform.userAgent)
    if(text == "" || text == null){return}
    if(text == 'out'){
        document.querySelector(".landingpage").style.display = "block"
        document.querySelector(".mainpage").style.display = "none"
    }
    else{
        document.querySelector(".landingpage").style.display = "none"
        document.querySelector(".mainpage").style.display = "flex"
        document.querySelector("[nav-target='menu-nav-page-hh']").click()
        var j = document.querySelectorAll(".ppi-only")
        if(text =='ipcn'){
            j.forEach((p)=>p.style.display = "block")
        }
        else {
            
            j.forEach((p)=>p.style.display = "none")
        }
    }
    // console.log("why -- ResetInput('all') ---????")
    ResetInput("all")
}
function NavTo(elem){
    var groupBtnTarget = elem.getAttribute('nav-group')
    var pageTargetID = elem.getAttribute('nav-target')
    document.querySelectorAll("[nav-group='"+groupBtnTarget+"']").forEach((p)=>p.classList.remove("active"))
    elem.classList.add("active")
    var pageTargetGroup = Elem(pageTargetID).getAttribute('nav-group')
    document.querySelectorAll("[nav-group='"+pageTargetGroup+"']").forEach((p)=>p.style.display = 'none')
    Elem(pageTargetID).style.display = 'block'
}
async function downloadDB(){
    loader(true)
    var urlRS = rsAPI + "?req=allget"
    var urlDB = dbAPI + "?req=allget"
    await fetch(urlRS)
        .then(respon => respon.json())
        .then(respon => {
            if(respon.ok){
                Toast("RSAPI - Success")
                globalVar["staffData"] = respon.staffData
                globalVar["unitData"] = respon.unitData
            }
        })
    await fetch(urlDB)
        .then(respon => respon.json())
        .then(respon => {
            if(respon.ok){
                Toast("DBAPI - Success")
                globalVar["hhData"] = respon.hhData
            }
        })
    localStorage.setItem("staffData", JSON.stringify(globalVar["staffData"]))
    localStorage.setItem("unitData", JSON.stringify(globalVar["unitData"]))
    localStorage.setItem("hhData", JSON.stringify(globalVar["hhData"]))
    console.log(globalVar)
    loader(false)
    if (loginPass){login("ipcn")}
    // ResetInput("all")
    // console.log("ASAS")
}
function addActive(elem){
    elem.classList.add("listCurrActive")
}
function SlideTo(elm, container){
    var pPos = elm.parentNode.getBoundingClientRect(), // parent pos
    cPos = elm.getBoundingClientRect(), // target pos
    pos = {
        top: "",
        right: "",
        bottom: "",
        left: ""    
    }   
    pos.top = cPos.top - pPos.top;
    pos.right = cPos.right - pPos.right;
    pos.bottom = cPos.bottom - pPos.bottom;
    pos.left = cPos.left - pPos.left;
    container.scrollTop += pos.top
    // console.log(pos.top)
}
function NameInList(inputId){
    var input = Elem(inputId)
    var dataSrc = globalVar[Elem(input.getAttribute("list-name")).getAttribute("list-data-to-filter")]
    if(input.value === ""){return}
    if(!(dataSrc.map(function (p){return p.name}).includes(input.value))){
        if(input.classList.contains("hh-filter-list-input")){
           input.value = "" 
        }
        else {Elem(inputId).classList.add("is-invalid")}
    }
    else {Elem(inputId).classList.remove("is-invalid")}
}
function isInputValid(inputType){
    if(inputType == "hh"){
        if(Elem('hh-input-nama').value === "" || Elem("hh-input-nama").classList.contains("is-invalid")){console.log("invalid input nama"); return false}
        if(document.querySelectorAll("[name=input-hh-kelompok]:checked").length === 0){console.log("invalid kelompok");return false}
        // name="input-hh-kelompok"
        if(Elem('hh-input-unit').value === "" || Elem("hh-input-unit").classList.contains("is-invalid")){console.log("invalid input unit");return false}
        if(isNaN(Elem("hh-input-bulan").value * 1)){console.log("invalid bulan");return false}
        if(!(Elem("hh-input-tahun").value > 2000)){console.log("invalid tahunn");return false}
        return true
    }
}
function TambahStaf(text){
    alert(text)
}
function TambahUnit(text){
    alert(text)
}
function SelectStaffBase(group, unit){
    var groups = ["dokter", "perawat", "siswa", "lain"]
    document.querySelectorAll(".radioBtn.input-hh-btn").forEach((p)=>p.checked = false)
    groups.forEach((p)=>{
        if(group.toLowerCase().indexOf(p) >= 0 ){Elem("input-hh-kelompok-" + p).checked = true}
    })
    Elem("hh-input-unit").value = unit
}
function ResetInput(type){
    var today = new Date()
    if(type === "all"){
        hhReset()
    }
    function hhReset(){
        Elem('hh-input-nama').value = ""; document.querySelectorAll(".input-hh-kelompok-btn").forEach((p)=> p.checked = false)
        Elem('hh-input-unit').value = ""; Elem("hh-input-bulan").value = today.getMonth() + 1 ; 
        Elem("hh-input-tahun").value = today.getFullYear()
        Elem("filter-hh-option-kelompok").options.selectedIndex = 0;
        var hhMonthUnique = GetHHUniqueMonth().sort((a, b)=>{return b[3] - a[3]})
        var inHt = "<option value='all'>Semua Bulan</option>"
        hhMonthUnique.forEach((p)=>{
            var newOp = "<option value='"+p[0]+"'>"+p[0]+"</option>"
            inHt += newOp
        })
        Elem("filter-hh-option-bulan").innerHTML = inHt
        Elem("filter-hh-option-bulan").value = "all"
        GetHHUniqueObserver()
        Elem("hh-filter-observer").value = ""
        Elem("hh-filter-unit").value = ""
        document.querySelectorAll(".HHSortBtn")[0].setAttribute("hh-sort-state", "up")
        HHSortTableHeader(document.querySelectorAll(".HHSortBtn")[0])
        HHFilterSort()
        // UpdateHHTable(globalVar["hhData"])
    }
    
}
function GetAllInput(type){
    if(type == "hh"){
        var input = {}
        input.object = Elem('hh-input-nama').value
        input.group = document.querySelectorAll('[name="input-hh-kelompok"]:checked').length > 0 ? document.querySelectorAll('[name="input-hh-kelompok"]:checked')[0].value : ""
        input.unit = Elem('hh-input-unit').value
        input.month = Elem('hh-input-bulan').value
        input.year = Elem('hh-input-tahun').value
        input.moment1 = document.querySelectorAll('[name="input-hh-mo1"]:checked').length === 0 ? "" : (document.querySelectorAll('[name="input-hh-mo1"]:checked')[0].value == "1" ? true : false) 
        input.moment2 = document.querySelectorAll('[name="input-hh-mo2"]:checked').length === 0 ? "" : (document.querySelectorAll('[name="input-hh-mo2"]:checked')[0].value == "1" ? true : false)
        input.moment3 = document.querySelectorAll('[name="input-hh-mo3"]:checked').length === 0 ? "" : (document.querySelectorAll('[name="input-hh-mo3"]:checked')[0].value == "1" ? true : false)
        input.moment4 = document.querySelectorAll('[name="input-hh-mo4"]:checked').length === 0 ? "" : (document.querySelectorAll('[name="input-hh-mo4"]:checked')[0].value == "1" ? true : false)
        input.moment5 = document.querySelectorAll('[name="input-hh-mo5"]:checked').length === 0 ? "" : (document.querySelectorAll('[name="input-hh-mo5"]:checked')[0].value == "1" ? true : false)
        
        return input
    }
}
function GetHHUniqueMonth(){
    var monthText = {
        1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr", 5:"Mei", 6:"Jun", 
        7:"Jul", 8:"Agu", 9:"Sep", 10:"Okt", 11:"Nov", 12:"Des"
    }
    var uniqueArray = {}
    globalVar["hhData"].forEach((p)=>{
        var sort = (p.month * 1) + (p.year*12)
        var text = monthText[p.month] + " " + (p.year)
        uniqueArray[sort] = {
            text: text,
            month: p.month,
            year: p.year
        }
    })
    var result = []
    Object.keys(uniqueArray).forEach((p)=>{
        result.push([uniqueArray[p].text,uniqueArray[p].month,uniqueArray[p].year, p])
    })
    return result
}
function GetHHUniqueObserver(){
    var a = globalVar["hhData"].map((p)=>{
        return p.observer
    })
    var aUnique = [...new Set(a)]
    var result = []
    aUnique.forEach((p)=>{
        var item = {name: p}
        result.push(item)
    })
    globalVar["uniqueObserver"] = result 
}
function EditHH(type, id){
    if(type === "show"){
        alert("edit hh id: " + id);
        editHHBtn.click()
    }
}
function HHSortTableHeader(elem){
    document.querySelectorAll(".HHSortBtn .bi:nth-child(1)").forEach((p)=>p.classList = "bi bi-caret-up")
    document.querySelectorAll(".HHSortBtn .bi:nth-child(2)").forEach((p)=>p.classList = "bi bi-caret-down")
    currentSort = elem.getAttribute("hh-sort-state")
    document.querySelectorAll(".HHSortBtn").forEach((p)=>p.setAttribute("hh-sort-state", "off"))
    if(currentSort === "up"){
        elem.setAttribute("hh-sort-state", "down")
        elem.querySelector(".bi:nth-child(2)").classList = "bi bi-caret-down-fill"
    }
    else {
        elem.setAttribute("hh-sort-state", "up")
        elem.querySelector(".bi:nth-child(1)").classList = "bi bi-caret-up-fill"
    } 
}
function hhTableGroupShow(n){
    tableMinShow.hh = n
}
function HHFilterSort(){
    var monthNum = {
        "Jan" : 1, 
        "Feb" : 2, 
        "Mar" : 3, 
        "Apr" : 4, 
        "Mei" : 5, 
        "Jun" : 6, 
        "Jul" : 7, 
        "Agu" : 8, 
        "Sep" : 9, 
        "Okt" : 10, 
        "Nov" : 11, 
        "Des" : 12
    }
    var data = globalVar["hhData"]
    var hhfilter = {}
    document.querySelectorAll("[filter-hh-type]").forEach((p)=>{
        hhfilter[p.getAttribute("filter-hh-type")] = p.value
    })
    if(hhfilter.group !== "all"){
        data = data.filter((p)=>{return p.group == hhfilter.group})
    }
    if(hhfilter.unit !== ""){
        data = data.filter((p)=>{return p.unit == hhfilter.unit})
    }
    if(hhfilter.monthyear !== "all"){
        data = data.filter((p)=>{
            return  p.month*1 === monthNum[hhfilter["monthyear"].toString().substring(0,3)]*1 &&
                    p.year*1 === hhfilter["monthyear"].toString().substring(4)*1
        })
    }
    var sort = {}
    document.querySelectorAll(".HHSortBtn").forEach((p)=>{
        sort[p.getAttribute("hh-sort-type")] = p.getAttribute("hh-sort-state")
    })
    switch (true){
        case sort.time === "down" :
            data.sort((a, b)=>{ return new Date(b.time) - new Date(a.time) })
            break;
        case sort.time === "up" :
            data.sort((a, b)=>{ return new Date(a.time) - new Date(b.time) })
            break;
        case sort.moment === "down" :
            data.sort((a, b)=>{ return totalMoment(b)*1 - totalMoment(a)*1})
            break;
        case sort.moment === "up" :
            data.sort((a, b)=>{ return totalMoment(a)*1 - totalMoment(b)*1 })
            break;
        default :
    }
    UpdateHHTable(data)
}
function UpdateHHTable(arr){
    nMin = tableMinShow.hh
    var len = arr.length
    if(nMin > len-1){nMin = len-1}
    var nMax = nMin + (hhTableDivider-1)
    if(nMax > len-1){nMax = len-1}
    var user = sendform.userName
    // console.log(sendform) 
    var nGroup = Math.floor((arr.length-1) / hhTableDivider)
    var curr_nGroup = Math.floor(nMin / hhTableDivider)
    var hhGroupingArrowBtns = document.querySelectorAll(".hh-grouping-btn-arrow")
    var hhGroupingNumBtns = document.querySelectorAll(".hh-grouping-btn-num")
    hhGroupingArrowBtns[1].querySelector("div").setAttribute("onclick", "hhTableGroupShow("+(nGroup * hhTableDivider)+"); HHFilterSort()")
    hhGroupingArrowBtns.forEach((p)=>{p.classList.remove("disabled")})
    hhGroupingNumBtns.forEach((p)=>{p.classList.remove("disabled");p.classList.remove("active")})
        // console.log("nMin:"+nMin)
        // console.log("nMax:"+nMax)
        // console.log("nGroup:"+nGroup)
        // console.log("curr_nGroup:"+curr_nGroup)
    if(nMin === 0){hhGroupingArrowBtns[0].classList.add("disabled")}
    if(nGroup<5 || curr_nGroup < 2 ){
        for(var i = 0; i<5;i++){
            var elem = hhGroupingNumBtns[i] 
            if(i < (nGroup+1) ){
                elem.querySelector("div").innerHTML = i+1
                elem.querySelector("div").setAttribute("onclick", "hhTableGroupShow("+(i * hhTableDivider)+"); HHFilterSort()")
                if(i === curr_nGroup){elem.classList.add("active")}
            }
            else {
                elem.querySelector("div").innerHTML = i+1
                elem.classList.add("disabled")
            }
        }
    }
    else {
        if(curr_nGroup > 1 && curr_nGroup < (nGroup - 1) ){
            for(var i = 0; i<5;i++){
                var elem = hhGroupingNumBtns[i] 
                if(i === 2){elem.classList.add("active")}
                elem.querySelector("div").innerHTML = (curr_nGroup + i - 1)
                elem.querySelector("div").setAttribute("onclick", "hhTableGroupShow("+((curr_nGroup + i - 2) * hhTableDivider)+"); HHFilterSort()")
            }   
        }
        else if(curr_nGroup >= (nGroup-1)){
        // else{
            for(var i = 0; i<5;i++){
                var elem = hhGroupingNumBtns[i]
                elem.querySelector("div").innerHTML = nGroup+i-3
                elem.querySelector("div").setAttribute("onclick", "hhTableGroupShow("+((nGroup+i-4) * hhTableDivider)+"); HHFilterSort()")
                if(i === (4 + curr_nGroup - nGroup)){
                    elem.classList.add("active")
                }
                if(curr_nGroup === nGroup){
                    hhGroupingArrowBtns[1].classList.add("disabled")
                }
            }
        }
    } 
    var monthText = {
        1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr", 5:"Mei", 6:"Jun", 
        7:"Jul", 8:"Agu", 9:"Sep", 10:"Okt", 11:"Nov", 12:"Des"
    }
    // console.log(user)
    Elem("hh-table-body").innerHTML = ""
    for(var i = nMin; i < (nMax+1); i ++ ){
        var dataItem = arr[i]
        var tr = document.createElement("tr")    
        if(user == dataItem["observer"] || user == "ipcn"){
            tr.setAttribute("onclick", "EditHH('show', "+arr[i].id+")")
        }
        var tgl = new Date(dataItem.time)
        var hour = tgl.getHours(); if(hour < 10){hour = "0"+hour}
        var minut = tgl.getMinutes(); if(minut < 10){minut = "0"+minut}
        var trInner = "<td>"+tgl.getDate()+"/"+(tgl.getMonth()+1)+"/"+tgl.getFullYear()+" "+hour+":"+minut+"</td>"
        trInner += "<td>"+dataItem.observer+"</td>"
        trInner += "<td>"+dataItem.object+"</td>"
        trInner += "<td>"+dataItem.unit+"</td>"
        trInner += "<td>"+dataItem.group+"</td>"
        trInner += "<td>"+monthText[dataItem.month]+" " + dataItem.year + "</td>"
        trInner += "<td>"+ (totalMoment(dataItem) === "" ? "" : (totalMoment(dataItem)+"%")) + "</td>"
        trInner += "<td>" + textMo(dataItem.mo1) + "</td>"
        trInner += "<td>" + textMo(dataItem.mo2) + "</td>"
        trInner += "<td>" + textMo(dataItem.mo3) + "</td>"
        trInner += "<td>" + textMo(dataItem.mo4) + "</td>"
        trInner += "<td>" + textMo(dataItem.mo5) + "</td>"
        tr.innerHTML = trInner
        Elem("hh-table-body").appendChild(tr)
        // console.log(tr)
    }
    function textMo(mo){
        if(mo === true){return "Y"}
        else if(mo === false){return "N"}
        else{return ""}
    }
}
function totalMoment(item){
    var act = 0; var opp = 0 
    for(var i = 1; i < 6; i++){
        var moVal = item["mo"+i] 
        moVal === "" ? "" : opp++
        moVal === true ? act++ : ""
    }
    if (opp == 0){return ""}
    var tot = act / opp * 100 
    return tot == 100 ? 100 : (tot.toFixed(1) * 1) 
}
