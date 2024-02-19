/*
Add the delete feature for the contacts
*/

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

// Setup startup screen
function startup() {
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

    // Contacts
    let contacts = data.contacts;
    for (let p in contacts) {
        contactCreate([contacts[p].name, contacts[p].title, contacts[p].contact])
    }

    startup()
});

// Setup the navigation drawer;
var navList = [
    { label: "School Profile", logo: "./assets/home.svg" },
    { label: "About School", logo: "./assets/home.svg" },
    { label: "Contacts", logo: "./assets/contacts.svg" }
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

// Contacts
function contactCreate(vals) {
    let tr = document.createElement("tr");
    tr.id = "tr"+contactsNum
    tr.style = "width: 100%;";
    for (let c = 0; c < 3; c++) {
        let td = document.createElement("td");
        td.style = "width: 30%;";
        let inp = document.createElement("input");
        inp.id = `${contactsNum}.${c}`
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
    delBtn.id = "del"+contactsNum
    delBtn.innerHTML = "&nbsp;"
    delBtn.style = "width: 100%; height: 100%; background-image: url('./assets/delete.svg'); background-position: center; background-repeat: no-repeat; background-size: contain;"
    td.appendChild(delBtn)
    tr.appendChild(td);
    delBtn.value = contactsNum;
    delBtn.onclick = function() {
        for (let d = this.value; d < contactsNum; d++) {
            for (let c = 0; c < 3; c++) {
                if (d != contactsNum - 1) {
                    document.getElementById(`${d}.${c}`).value = document.getElementById(`${parseInt(d) + 1}.${c}`).value
                };
            }
        }
        document.getElementById(`tr${contactsNum - 1}`).remove();
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
            name: document.getElementById(`${o}.0`).value.trim(),
            title: document.getElementById(`${o}.1`).value.trim(),
            contact: document.getElementById(`${o}.2`).value.trim()
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
                console.log(`${i}.${j}`)
                document.getElementById(`${i}.${j}`).disabled = true;
            }
        }
        this.disabled = true;
        this.innerHTML = "Uploading";
        document.getElementById("contactsAdd").disabled = true;
        writeData("startup/contacts", tempData, function() {
            for (let i = 0; i < contactsNum; i++) {
                for (let j = 0; j < 3; j++) {
                    console.log(`${i}.${j}`)
                    document.getElementById(`${i}.${j}`).disabled = false;
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