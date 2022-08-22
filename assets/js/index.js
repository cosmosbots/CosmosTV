var applicationSelector = null;
var contentHolder = null;
var greetingText = null;
var clockTime = null;
var clockDate = null;
var bgImg = null;
var ldImg = null;

function timeUpdateLoop() {
    function checkTime(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    var date = new Date();
    var time = checkTime(date.getHours()) + ":" + checkTime(date.getMinutes());
    var dateString = date.toLocaleDateString();
    clockTime.innerHTML = time;
    clockDate.innerHTML = dateString;
    setTimeout(timeUpdateLoop, 1e3);
}

async function openDisneyPlus() {
    var cwd = await window.electron.cwd()
    var loadId = await window.electron.executeCommand('ol-disneyplus', 'https://www.disneyplus.com/home')
}

function init() {
    window.electron.pingBackend()
    .then(d => {
        console.log("Backend ping response: " + d)
    });

    if (document.body === null) {
        setTimeout(init, 100);
    }

    try {
        // Application initialisation functions
        console.log("Starting application");

        applicationSelector = document.getElementsByClassName("applicationselector")[0];
        contentHolder = document.getElementById("content");
        greetingText = document.getElementsByClassName("greeting")[0];
        clockTime = document.getElementsByClassName("clock")[0];
        clockDate = document.getElementsByClassName("clockdate")[0];
        bgImg = document.getElementsByClassName("backgroundimg")[0];
        ldImg = document.getElementsByClassName("loadingimg")[0];

        timeUpdateLoop();
    } catch (e) {
        console.log(e);
        
        // Show red failure cosmos logo
        ldImg.style.transition = "0s";
        setTimeout(() =>{
            ldImg.style.filter = "invert(42%) sepia(93%) saturate(2000%) hue-rotate(-45deg) brightness(75%) contrast(200%)";
        }, 50);
        return
    }

    ldImg.style.opacity = "0";

    setTimeout(() => {
        applicationSelector.style.backdropFilter = "blur(4px)";
        bgImg.style.opacity = ".6";

        setTimeout(() => {
            applicationSelector.style.bottom = "38px";
            applicationSelector.style.opacity = "1";
            applicationSelector.style.width = "calc(100% - 76px)";
            applicationSelector.style.marginLeft = "38px";

            greetingText.style.opacity = "1";
            greetingText.style.marginLeft = "38px";
            greetingText.getElementsByTagName("span")[0].style.marginLeft = "38px";

            clockTime.style.opacity = "1";
            clockTime.style.right = "38px";

            clockDate.style.opacity = "1";
            clockDate.style.right = "38px";

            contentHolder.style.marginTop = "38px";
            contentHolder.style.height = "calc(100% - 38px)"
        }, 360);
    }, 500);
}

window.onload = () => {
    console.log("Waiting for document to render");
    setTimeout(() => {
        init();
    }, 1e3);
}