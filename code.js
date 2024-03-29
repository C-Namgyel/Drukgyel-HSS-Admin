// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-analytics.js";
import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjpnWMiVf0inGKOiyiXG_AqcmvfVzfq1E",
    authDomain: "drukgyel-hss-4a7f7.firebaseapp.com",
    databaseURL: "https://drukgyel-hss-4a7f7-default-rtdb.firebaseio.com/",
    projectId: "drukgyel-hss-4a7f7",
    storageBucket: "drukgyel-hss-4a7f7.appspot.com",
    messagingSenderId: "728432489451",
    appId: "1:728432489451:web:83f9979d39672748df9fae",
    measurementId: "G-RB5MMY67QV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase();

// Firebase Functions
function getAllDatas(code) {
    get(ref(database)).then((snapshot) => {
        if (snapshot.exists()) {
            code(snapshot.val());
        } else {
            code([])
        };
    }).catch((error) => {
        console.error(error);
    });
};
function getData(path, code) {
    get(child(ref(database), path)).then((snapshot) => {
        if (snapshot.exists()) {
            code(snapshot.val());
        } else {
            code({});
        };
    }).catch((error) => {
        console.error(error);
    });
};
function writeData(path, data, code) {
    set(ref(database, path), data).then(() => {
        code();
    });
};

function deleteData(path, code) {
    remove(ref(database, path)).then(() => {
        code()
    })
}

// Handle Online and Offline Changes
window.onoffline = function() {
    let p = createPrompt();
    p[0].style.height = "auto";
    p[0].style.backgroundColor = "white";
    p[0].style.fontSize = "5vw";
    p[0].style.fontWeight = "bolder";
    p[0].innerHTML = "You went Offline!<br>Please reconnect to continue";
    p[1].hidden = true;
    window.ononline = function() {
        p[1].click();
    };
};

// Basic Functions
function getTime(x) {
    let time = new Date(parseInt(x));
    let hours = String(time.getHours()).padStart(2, '0');
    let minutes = String(time.getMinutes()).padStart(2, '0');
    let ampm = "am"
    if (parseInt(hours) > 12) {
        hours = parseInt(hours) - 12;
        ampm = "pm"
    }
    return(`${hours}:${minutes} ${ampm}`)
}
function convertJSONtoXLSX(jsonContent, heading, sheet) {
    var workbook = XLSX.utils.book_new();
    var worksheet = XLSX.utils.json_to_sheet(jsonContent, { header: heading });
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet);
    return workbook;
}
function downloadXLSX(fileName, heading, content, sheet, colWidths) {
    var workbook = convertJSONtoXLSX(content, heading, sheet);
    var worksheet = workbook.Sheets[sheet];
    worksheet['!cols'] = colWidths.map(width => ({ wch: width }));
    XLSX.writeFile(workbook, fileName);
}

// Setup startup screen
function startup() {
    var pass = data.password;
    if (prompt("Enter the password") == pass) {
        let urlParams = new URLSearchParams(window.location.search);
        let initialValue = urlParams.get('page');
        let par = initialValue || undefined; // Use a default value if the parameter is not presents
        let availScreens = navList.map(item => item.label);
        if (par != undefined && availScreens.includes(par)) {
            document.getElementById(par + " Btn").click();
        } else {
            if (window.location.search.lastIndexOf('?') == -1) {
                document.getElementById("School Profile Btn").click();
            };
        };
    } else {
        startup();
    }
}

// Global Variables
var data = undefined;

// Splash Screen
var splash = false;
var loading = "loading"
if ((navigator.onLine ? "Online" : "Offline") == "Offline") {
    loading = "Failed"
}
document.getElementById("splashLogo").onanimationend = function () {
    setTimeout(function () {
        splash = true;
        if (data != undefined) {
            document.getElementById("splashDiv").remove();
            loading = "Loaded";
            startup()
        } else {
            if (loading == "loading") {
                document.getElementById("splashLoad").innerHTML = "Loading Data<br>Please Wait";
            } else {
                document.getElementById("splashLoad").innerHTML = "No Internet Connection";
            }
            setTimeout(function() {
                if (loading == "loading") {
                    document.getElementById("splashLoad").innerHTML = "Unstable Network<br>Please Try Again Later";
                }
            }, 5000);
        };
    }, 500);
};
getData("startup", function (res) {
    data = res;

    // Splash
    if (splash == true) {
        document.getElementById("splashDiv").remove();
        loading = "Loaded";
        startup()
    };

    // School Profile
    for (let y of document.querySelectorAll(".schoolProfile")) {
        y.style.float = "right";
    }
    let schoolProfile = data.schoolProfile;
    document.getElementById("principal").value = schoolProfile["Principal"]
    document.getElementById("vp1").value = schoolProfile["Vice Principal"][0]
    document.getElementById("vp2").value = schoolProfile["Vice Principal"][1]
    document.getElementById("teachers").value = schoolProfile["Teachers"]
    document.getElementById("supportingStaffs").value = schoolProfile["Supporting Staffs"]
    document.getElementById("boys").value = schoolProfile["Boys"]
    document.getElementById("girls").value = schoolProfile["Girls"]
    document.getElementById("boarders").value = schoolProfile["Boarders"]
    document.getElementById("dayScholars").value = schoolProfile["Day Scholars"]

    // About
    document.getElementById("aboutDiv").value = data.aboutSchool;

    // Attendance
    let attendance = data.attendance;
    let sortedKeys = Object.keys(attendance)
    .map(key => ({ key, length: key.length }))
    .sort((a, b) => a.length - b.length)
    .map(obj => obj.key);
    attendance = sortedKeys.reduce((acc, key) => {
        acc[key] = attendance[key];
        return acc;
    }, {});
    for (let p of Object.keys(attendance)) {
        attendanceCreate([p, attendance[p]])
    }

    // Contacts
    let contacts = data.contacts;
    for (let p in contacts) {
        contactCreate([contacts[p].name, contacts[p].title, contacts[p].contact])
    }
});

// Setup the navigation drawer;
var navList = [
    { label: "School Profile", logo: "./assets/home.svg" },
    { label: "About School", logo: "./assets/home.svg" },
    { label: "Attendance", logo: "./assets/attendance.svg" },
    { label: "Casual Leave", logo: "./assets/sandglass.svg" },
    { label: "In Campus Leave", logo: "./assets/sandglass.svg" },
    { label: "Study Report", logo: "./assets/report.svg" },
    { label: "Contacts", logo: "./assets/contacts.svg" },
    { label: "Staff Attendance", logo: "./assets/attendance.svg" },
    { label: "Change Password", logo: "./assets/key.svg"}
];
for (let d = 0; d < navList.length; d++) {
    let a = document.createElement("a");
    a.style = "text-decoration: none; display: flex; align-items: center;";
    a.value = navList[d].label;
    a.id = navList[d]["label"] + " Btn";
    let img = document.createElement("img");
    img.style = "height: 25px";
    img.src = navList[d].logo;
    a.appendChild(img);
    a.innerHTML += "&nbsp;&nbsp;&nbsp;";
    let b = document.createElement("b");
    b.style = "color: black; font-size: 5vw;";
    b.innerHTML = navList[d].label;
    a.appendChild(b);
    document.getElementById("navSubHolder").appendChild(a);
    document.getElementById("navSubHolder").appendChild(document.createElement("br"));
    a.onclick = function () {
        let val = a.value
        if (setScreen(val) == true) {
            document.getElementById("header").innerHTML = val;
            if (document.getElementById("navBarrier").hidden == false) {
                navClose();
            };
            window.history.pushState({}, null, window.location.search.substring(0, window.location.search.lastIndexOf('?')) + "?page=" + a.value);
            if (val == "About School") {
                document.getElementById("aboutDiv").style.height = (document.getElementById("aboutDiv").scrollHeight + 10) + "px"
            }
        }
    };
};

// School Profile
document.getElementById("schoolProfileUpload").onclick = function(eve) {
    let tempData = {
        "Boarders": document.getElementById("boarders").value.trim(),
        "Boys": document.getElementById("boys").value.trim(),
        "Day Scholars": document.getElementById("dayScholars").value,
        "Girls": document.getElementById("girls").value,
        "Principal": document.getElementById("principal").value,
        'Supporting Staffs': document.getElementById("supportingStaffs").value,
        "Teachers": document.getElementById("teachers").value,
        "Vice Principal": [document.getElementById("vp1").value, document.getElementById("vp2").value]
    }
    let approved = true;
    for (let i of Object.keys(tempData)) {
        if (tempData[i] == undefined || tempData[i] == "") {
            approved = false;
            break
        }
    }
    if (approved == true) {
        for (let y of document.querySelectorAll(".schoolProfile")) {
            y.disabled = true;
        }
        this.disabled = true;
        this.innerHTML = "Uploading";
        writeData("startup/schoolProfile", tempData, function() {
            for (let y of document.querySelectorAll(".schoolProfile")) {
                y.disabled = false;
            }
            eve.target.disabled = false;
            eve.target.innerHTML = "Upload";
        })
    } else {
        alert("Please fill up all the fields")
    }
}

// About School
document.getElementById("aboutDiv").oninput = function() {
    console.log("change")
    let st = document.getElementById("About School").scrollTop;
    this.style.height = "0px"
    this.style.height = (this.scrollHeight + 10) + "px";
    document.getElementById("About School").scrollTop = st;
}
document.getElementById("aboutUpload").onclick = function(ev) {
    let b = ev.target
    let a = document.getElementById("aboutDiv")
    b.disabled = true;
    b.innerHTML = "Uploading"
    a.disabled = true
    writeData("startup/aboutSchool", a.value, function() {
        b.innerHTML = "Upload";
        b.disabled = false
        a.disabled = false
    })
}

// Attendance
function attendanceCreate(vals) {
    let tr = document.createElement("tr");
    tr.id = "attendanceTr"+attendanceNum
    tr.style = "width: 100%;";
    for (let c = 0; c < 2; c++) {
        let td = document.createElement("td");
        let inp = document.createElement("input");
        inp.id = `attendance${attendanceNum}.${c}`
        if (c == 0) {
            td.style = "width: 30%;";
        } else {
            td.style = "width: 60%;";
        }
        inp.style = "width: 100%;";
        inp.value = vals[c]
        td.appendChild(inp);
        tr.appendChild(td);
    }
    let td = document.createElement("td");
    td.style = "width: 10%;";
    let delBtn = document.createElement("button");
    delBtn.id = "attendanceDel"+attendanceNum
    delBtn.innerHTML = "&nbsp;"
    delBtn.style = "width: 100%; height: 100%; background-image: url('./assets/delete.svg'); background-position: center; background-repeat: no-repeat; background-size: contain;"
    td.appendChild(delBtn)
    tr.appendChild(td);
    delBtn.value = attendanceNum;
    delBtn.onclick = function() {
        for (let d = this.value; d < attendanceNum; d++) {
            for (let c = 0; c < 2; c++) {
                if (d != attendanceNum - 1) {
                    document.getElementById(`attendance${d}.${c}`).value = document.getElementById(`attendance${parseInt(d) + 1}.${c}`).value
                };
            }
        }
        document.getElementById(`attendanceTr${attendanceNum - 1}`).remove();
        attendanceNum -= 1;
    }
    document.getElementById("attendanceTable").appendChild(tr)
    attendanceNum += 1;
}
var attendanceNum = 0;
document.getElementById("attendanceAdd").onclick = function() {
    attendanceCreate(["", "", ""])
}
document.getElementById("attendanceUpload").onclick = function(eve) {
    let tempData = {};
    for (let o = 0; o < attendanceNum; o++) {
        tempData[document.getElementById(`attendance${o}.0`).value.trim()] = document.getElementById(`attendance${o}.1`).value.trim()
    }
    let approved = true;
    for (let i = 0; i < attendanceNum; i++) {
        for (let j = 0; j < 2; j++) {
            if (document.getElementById(`attendance${i}.${j}`).value == undefined || document.getElementById(`attendance${i}.${j}`).value.trim() == "") {
                approved = false;
                break
            }
        }
    }
    if (approved == true) {
        for (let i = 0; i < attendanceNum; i++) {
            for (let j = 0; j < 2; j++) {
                document.getElementById(`attendance${i}.${j}`).disabled = true;
            }
        }
        this.disabled = true;
        this.innerHTML = "Uploading";
        document.getElementById("attendanceAdd").disabled = true;
        writeData("startup/attendance", tempData, function() {
            for (let i = 0; i < attendanceNum; i++) {
                for (let j = 0; j < 2; j++) {
                    document.getElementById(`attendance${i}.${j}`).disabled = false;
                }
            }
            eve.target.disabled = false;
            eve.target.innerHTML = "Upload";
            document.getElementById("attendanceAdd").disabled = false;
        })
    } else {
        alert("Please fill up all the fields")
    }
}

// Casual Leave
var casualLeaves = []
document.getElementById("casualLeaveGet").onclick = function(ev) {
    document.getElementById("casualLeaveDownload").disabled = true;
    this.disabled = true;
    this.innerHTML = "Retrieving Data. Please Wait.";
    getData("casualLeaves", function(res) {
        document.getElementById("casualLeaveDownload").disabled = false;
        ev.target.disabled = false;
        ev.target.innerHTML = "Retrieve Data";
        casualLeaves = []
        for (let d of Object.keys(res)) {
            for (let t of Object.keys(res[d])) {
                casualLeaves.push({
                    "Date": d,
                    "Name": res[d][t].name, 
                    "Type of Leave": res[d][t].type,
                    "Duration": res[d][t].duration,
                    "Start Date": res[d][t].startDate,
                    "End Date": res[d][t].endDate,
                    "Reason": res[d][t].reason
                })
            }
        }
    })
}
document.getElementById("casualLeaveDownload").onclick = function() {
    downloadXLSX(`Casual Leave Record ${getTodayDate()}.xlsx`, ["Date", "Name", "Type of Leave", "Duration", "Start Date", "End Date", "Reason"], casualLeaves, "Sheet1", [12, 25, 20, 10, 15, 15, 45])      
}

// In Campus Leave
var inCampusLeaves = []
document.getElementById("inCampusLeaveGet").onclick = function(ev) {
    document.getElementById("inCampusLeaveDownload").disabled = true;
    this.disabled = true;
    this.innerHTML = "Retrieving Data. Please Wait.";
    getData("inCampusLeaves", function(res) {
        document.getElementById("inCampusLeaveDownload").disabled = false;
        ev.target.disabled = false;
        ev.target.innerHTML = "Retrieve Data";
        inCampusLeaves = []
        for (let d of Object.keys(res)) {
            for (let t of Object.keys(res[d])) {
                inCampusLeaves.push({
                    "Date": res[d][t].date,
                    "Time": res[d][t].time,
                    "Name": res[d][t].name, 
                    "Purpose": res[d][t].purpose,
                    "Period": res[d][t].period
                })
            }
        }
    })
}
document.getElementById("inCampusLeaveDownload").onclick = function() {
    downloadXLSX(`In Campus Leave Record ${getTodayDate()}.xlsx`, ["Date", "Time", "Name", "Purpose", "Period"], inCampusLeaves, "Sheet1", [12, 10, 25, 45, 45])      
}

// Study Report
var studyReports = []
document.getElementById("studyReportGet").onclick = function(ev) {
    document.getElementById("studyReportDownload").disabled = true;
    this.disabled = true;
    this.innerHTML = "Retrieving Data. Please Wait.";
    getData("studyReports", function(res) {
        document.getElementById("studyReportDownload").disabled = false;
        ev.target.disabled = false;
        ev.target.innerHTML = "Retrieve Data";
        studyReports = []
        for (let d of Object.keys(res)) {
            for (let t of Object.keys(res[d])) {
                studyReports.push({
                    "Date": d,
                    "ToD": res[d][t].teacher,
                    "Study": res[d][t].study,
                    "Absentee": res[d][t].absentee.replaceAll("\n", ", \n")
                })
            }
        }
    })
}
document.getElementById("studyReportDownload").onclick = function() {
    downloadXLSX(`Study Report Record ${getTodayDate()}.xlsx`, ["Date", "ToD", "Study", "Absentee"], studyReports, "Sheet1", [12, 25, 20, 50])      
}

// Contacts
function contactCreate(vals) {
    let tr = document.createElement("tr");
    tr.id = "contactTr"+contactsNum
    tr.style = "width: 100%;";
    for (let c = 0; c < 3; c++) {
        let td = document.createElement("td");
        td.style = "width: 30%;";
        let inp = document.createElement("input");
        inp.id = `contact${contactsNum}.${c}`
        if (c == 2) {
            inp.type = "number";
        }
        inp.style = "width: 100%;";
        inp.value = vals[c]
        td.appendChild(inp);
        tr.appendChild(td);
    }
    let td = document.createElement("td");
    td.style = "width: 10%;";
    let delBtn = document.createElement("button");
    delBtn.id = "contactDel"+contactsNum
    delBtn.innerHTML = "&nbsp;"
    delBtn.style = "width: 100%; height: 100%; background-image: url('./assets/delete.svg'); background-position: center; background-repeat: no-repeat; background-size: contain;"
    td.appendChild(delBtn)
    tr.appendChild(td);
    delBtn.value = contactsNum;
    delBtn.onclick = function() {
        for (let d = this.value; d < contactsNum; d++) {
            for (let c = 0; c < 3; c++) {
                if (d != contactsNum - 1) {
                    document.getElementById(`contact${d}.${c}`).value = document.getElementById(`contact${parseInt(d) + 1}.${c}`).value
                };
            }
        }
        document.getElementById(`contactTr${contactsNum - 1}`).remove();
        contactsNum -= 1;
    }
    document.getElementById("contactsTable").appendChild(tr)
    contactsNum += 1;
}
var contactsNum = 0;
document.getElementById("contactsAdd").onclick = function() {
    contactCreate(["", "", ""])
}
document.getElementById("contactsUpload").onclick = function(eve) {
    let tempData = {};
    for (let o = 0; o < contactsNum; o++) {
        tempData[o] = {
            name: document.getElementById(`contact${o}.0`).value.trim(),
            title: document.getElementById(`contact${o}.1`).value.trim(),
            contact: document.getElementById(`contact${o}.2`).value.trim()
        }
    }
    let approved = true;
    for (let i of Object.keys(tempData)) {
        for (let j of Object.keys(tempData[i])) {
            if (tempData[i][j] == undefined || tempData[i][j] == "") {
                approved = false;
                break
            }
        }
    }
    if (approved == true) {
        for (let i = 0; i < contactsNum; i++) {
            for (let j = 0; j < 3; j++) {
                document.getElementById(`contact${i}.${j}`).disabled = true;
            }
        }
        this.disabled = true;
        this.innerHTML = "Uploading";
        document.getElementById("contactsAdd").disabled = true;
        writeData("startup/contacts", tempData, function() {
            for (let i = 0; i < contactsNum; i++) {
                for (let j = 0; j < 3; j++) {
                    document.getElementById(`contact${i}.${j}`).disabled = false;
                }
            }
            eve.target.disabled = false;
            eve.target.innerHTML = "Upload";
            document.getElementById("contactsAdd").disabled = false;
        })
    } else {
        alert("Please fill up all the fields")
    }
}

// Change Password
var space = 0;
document.getElementById("changeInp").oninput = function(event) {
    if (event.data == " ") {
        space += 1;
    }
    if (this.value[0] == " " || space == 2) {
        this.value = this.value.trim() + " ";
        space = 0;
    }
}
document.getElementById("changeBtn").onclick = function(ev) {
    this.disabled = true;
    this.innerHTML = "Changing";
    document.getElementById("changeInp").disabled = true;
    writeData("startup/password", document.getElementById("changeInp").value, function() {
        ev.target.disabled = false;
        ev.target.innerHTML = "Change";
        document.getElementById("changeInp").disabled = false;
    })
}