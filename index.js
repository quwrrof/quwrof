const windows  = Array.from(document.querySelectorAll('.bomboclaat'));
const windowEl = document.querySelector('#myWindow');
const windowEk = document.querySelector('#Window2');
const windowEj = document.querySelector('#Window3');
const tipWindow = document.querySelector('#tipWindow');
const mainBox = document.querySelector('.box');
let zCounter = 10;
let previousMainBoxRect = mainBox ? mainBox.getBoundingClientRect() : null;


// sounds
function closeSound() {
    var sound = document.getElementById('closesound');
    sound.play();
}

function clickSound() {
    var sound = document.getElementById('clicksound');
    sound.play();
}

// bring window to front when clicked
function bringToFront(el) {
    zCounter += 1;

    if (zCounter > 100) {
        zCounter = 10
        document.querySelectorAll('.bomboclaat').forEach((w, i) => {
        w.style.zIndex = 10 + i; });
    }
    
    el.style.zIndex = zCounter;
}

function clampWindowPosition(el, left, top) {
    const maxLeft = Math.max(0, window.innerWidth - el.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - el.offsetHeight);

    return {
        left: Math.min(Math.max(0, left), maxLeft),
        top: Math.min(Math.max(0, top), maxTop),
    };
}

function moveWindowsWithMainBox() {
    if (!mainBox) return;

    const nextMainBoxRect = mainBox.getBoundingClientRect();

    if (!previousMainBoxRect) {
        previousMainBoxRect = nextMainBoxRect;
        return;
    }

    const deltaX = nextMainBoxRect.left - previousMainBoxRect.left;
    const deltaY = nextMainBoxRect.top - previousMainBoxRect.top;

    previousMainBoxRect = nextMainBoxRect;

    if (!deltaX && !deltaY) {
        return;
    }

    windows.forEach(win => {
        const currentLeft = parseFloat(win.style.left || window.getComputedStyle(win).left);
        const currentTop = parseFloat(win.style.top || window.getComputedStyle(win).top);

        if (Number.isNaN(currentLeft) || Number.isNaN(currentTop)) {
            return;
        }

        const nextPosition = clampWindowPosition(win, currentLeft + deltaX, currentTop + deltaY);
        win.style.left = nextPosition.left + 'px';
        win.style.top = nextPosition.top + 'px';
    });
}

// switching between tabs
function setActiveTab(win, tabName) {
    if (!win) return;
    const tabButtons = Array.from(win.querySelectorAll('.tab-btn'));
    const tabPanels  = Array.from(win.querySelectorAll('.tab-panel'));
    const tooltip    = win.querySelector('.tooltip');

    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tab === tabName);
    });
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function initWindow(win) {
    const tabButtons = Array.from(win.querySelectorAll('.tab-btn'));
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveTab(win, btn.dataset.tab);
            win.classList.add('show');
            bringToFront(win);
        });
    });

    const tooltip        = win.querySelector('.tooltip');
    const container      = win.querySelector('.window-content');
    const tooltipTargets = Array.from(win.querySelectorAll('.tooltip-target'));

    if (tooltip && container && tooltipTargets.length) {
        tooltipTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                tooltip.textContent = target.dataset.tooltip || target.textContent;
                tooltip.style.display = 'block';
            });

            target.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const offsetX = 20;
                const offsetY = 50;

                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                tooltip.style.left = (x + offsetX) + 'px';
                tooltip.style.top  = (y + offsetY) + 'px';
            });

            target.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        });
    }
}


// draggable windows
function makeDraggable (element) {
    // Make an element draggable (or if it has a .window-top class, drag based on the .window-top element)
    let currentPosX = 0, currentPosY = 0, previousPosX = 0, previousPosY = 0;

		// If there is a window-top classed element, attach to that element instead of full window
    if (element.querySelector('.window-top')) {
        // If present, the window-top element is where you move the parent element from
        element.querySelector('.window-top').onmousedown = dragMouseDown;
    } 
    else {
        // Otherwise, move the element itself
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown (e) {
        bringToFront(element);
        // Prevent any default action on this element (you can remove if you need this element to perform its default action)
        e.preventDefault();
        // Get the mouse cursor position and set the initial previous positions to begin
        previousPosX = e.clientX;
        previousPosY = e.clientY;
        // When the mouse is let go, call the closing event
        document.addEventListener('mouseup', closeDragElement);
        // call a function whenever the cursor moves
        document.addEventListener('mousemove', elementDrag);
    }

function elementDrag(e) {
    e.preventDefault();

    currentPosX = previousPosX - e.clientX;
    currentPosY = previousPosY - e.clientY;

    previousPosX = e.clientX;
    previousPosY = e.clientY;

    let newTop = element.offsetTop - currentPosY;
    let newLeft = element.offsetLeft - currentPosX;

    const nextPosition = clampWindowPosition(element, newLeft, newTop);
    element.style.top = nextPosition.top + 'px';
    element.style.left = nextPosition.left + 'px';
}

    function closeDragElement () {
        // Stop moving when mouse button is released and release events
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
    }
}

// main buttons
const aboutBtn = document.querySelector('.about');
if (aboutBtn && windowEl) {
    aboutBtn.addEventListener('click', () => {
        setActiveTab(windowEl, 'about');
        windowEl.classList.add('show');
        bringToFront(windowEl);
    });
}

const tipBtn = document.querySelector('.tip');
if (tipBtn && tipWindow) {
    tipBtn.addEventListener('click', () => {
        const btnRect = tipBtn.getBoundingClientRect();
        const tipWidth = parseFloat(getComputedStyle(tipWindow).width) || 250;
        const tipHeight = parseFloat(getComputedStyle(tipWindow).height) || 200;

        const margin = 8;
        const offsetX = -60;
        const offsetY = 12;

        let left = btnRect.right + offsetX;
        let top = btnRect.top - tipHeight - offsetY;

        const maxLeft = window.innerWidth - tipWidth - margin;
        const maxTop = window.innerHeight - tipHeight - margin;

        left = Math.min(Math.max(margin, left), maxLeft);
        top = Math.min(Math.max(margin, top), maxTop);

        tipWindow.style.left = left + 'px';
        tipWindow.style.top = top + 'px';

        setActiveTab(tipWindow, 'tip');
        tipWindow.classList.add('show');
        bringToFront(tipWindow);
    });
}

const wipBtn = document.querySelector('.wip1');
if (wipBtn && windowEk) {
    wipBtn.addEventListener('click', () => {
        setActiveTab(windowEk, 'commonplaceb');
        windowEk.classList.add('show');
        bringToFront(windowEk);
    });
}

const wip2Btn = document.querySelector('.wip2');
if (wip2Btn && windowEk) {
    wip2Btn.addEventListener('click', () => {
        setActiveTab(windowEj, 'random');
        windowEj.classList.add('show');
        bringToFront(windowEj);
    });
}

windows.forEach(win => {
    initWindow(win);
    makeDraggable(win);
    win.addEventListener('mousedown', () => bringToFront(win));
});

window.addEventListener('resize', moveWindowsWithMainBox);


// close the window on click of an x button
document.addEventListener('click', e => {
    const win = e.target.closest('.bomboclaat');
    if (e.target.closest('.close') && win) {
        win.classList.remove('show');
    }
});
