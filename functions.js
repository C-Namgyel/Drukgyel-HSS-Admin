// Functions
function getScreen() {
    for (let s = 0; s < document.querySelectorAll(".scrn").length; s++) {
        if (document.querySelectorAll(".scrn")[s].hidden == false) {
            return(document.querySelectorAll(".scrn")[s])
        }
    }
}
function animation(elem, name, duration) {
    elem.style.animationName = name;
    elem.style.animationDuration = duration;
    elem.style.animationFillMode = "forwards"
    elem.style.animationTimingFunction = "calc()"
}
function setScreen(id) {
    if (document.getElementById(id) != null) {
        for (let s = 0; s < document.querySelectorAll(".scrn").length; s++) {
            if (document.querySelectorAll(".scrn")[s].id == id) {
                document.querySelectorAll(".scrn")[s].hidden = false;
            } else {
                document.querySelectorAll(".scrn")[s].hidden = true;
            }
        }
        return true
    } else {
        console.error("The screen doesn't exist")
        return false
    }
}
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
function fetchimage(dataImage) {
    return("data:image/png;base64," + dataImage)
}
function navOpen() {
    document.getElementById("navBarrier").hidden = false;
    animation(document.getElementById("navDiv"), "navOpen", "0.5s")
    animation(document.getElementById("navBarrier"), "fadeIn", "0.5s")
}
function navClose() {
    animation(document.getElementById("navDiv"), "navClose", "0.5s")
    animation(document.getElementById("navBarrier"), "fadeOut", "0.5s")
    setTimeout(function() {
        document.getElementById("navBarrier").hidden = true;
    }, 500)
}
function blob2file(blobUrl, fileName, fileType, code) {
    fetch(blobUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            const file = new File([arrayBuffer], fileName, { type: fileType });
            code(file)
        })
        .catch(error => console.error(error));
}
function compressImage(file, compressor, code) {
    function dataURLToBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const b64 = atob(parts[1]);
        let array = [];
        for (let i = 0; i < b64.length; i++) {
            array.push(b64.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: contentType });
    }
    let img = new Image();
    let url = URL.createObjectURL(file)
    img.src = url;
    img.onload = function() {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let compressedImageData = canvas.toDataURL(file.type, compressor);
        let blob = dataURLToBlob(compressedImageData)
        let blobUrl = URL.createObjectURL(blob)
        blob2file(blobUrl, file.name, file.type, function(res) {
            code(res)
        })
    }
}
function sortObject(data, sortBy, aToZ) {
    data = Object.entries(data);
    data.sort((a, b) => {
        let valA = a[1][sortBy].toLowerCase();
        let valB = b[1][sortBy].toLowerCase();
        if (aToZ) {
            return valA.localeCompare(valB);
        } else {
            return valB.localeCompare(valA);
        }
    });
    let sortedObject = {};
    data.forEach(entry => {
        sortedObject[entry[0]] = entry[1];
    });
    return sortedObject;
}
function previousDate(time) {
    let tempDate = time.split("-");
    let year = tempDate[0];
    let month = tempDate[1];
    let date = tempDate[2];
    date -= 1;
    if (date <= 0) {
        month -= 1;
        console.log(month)
        if ([1,3,5,7,8,10,12].includes(month)) {
            date = 31;
        } else if ([4,6,9,11].includes(month)) {
            date = 30;
        } else {
            if (year % 4 == 0) {
            date = 29;
            } else {
            date = 28
            }
        }
    };
    if (month <= 0) {
        year -= 1;
    };
    return(`${year}-${month.toString().padStart(2, "0")}-${date.toString().padStart(2, "0")}`)
}
function timeToWords(time) {
    let tempTime = time.split('-');
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return(`${months[parseInt(tempTime[1]) - 1]} ${tempTime[2]}, ${tempTime[0]}`)
}
function getTodayDate() {
    let time = new Date();
    return(`${time.getFullYear()}-${(time.getMonth() + 1).toString().padStart(2, "0")}-${time.getDate().toString().padStart(2, "0")}`);
}
function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}