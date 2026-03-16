const windows  = Array.from(document.querySelectorAll('.bomboclaat'));
const windowEl = document.querySelector('#myWindow');
const windowEk = document.querySelector('#Window2');
const windowEj = document.querySelector('#Window3');
const tipWindow = document.querySelector('#tipWindow');
const updateWindow = document.querySelector('#updateWindow');
const mainBox = document.querySelector('.box');
let zCounter = 10;


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

function syncWindowOffset(el) {
    if (!el || !mainBox) return;

    const mainBoxRect = mainBox.getBoundingClientRect();
    const currentLeft = parseFloat(el.style.left || window.getComputedStyle(el).left);
    const currentTop = parseFloat(el.style.top || window.getComputedStyle(el).top);

    if (Number.isNaN(currentLeft) || Number.isNaN(currentTop)) {
        return;
    }

    el.dataset.offsetX = String(currentLeft - mainBoxRect.left);
    el.dataset.offsetY = String(currentTop - mainBoxRect.top);
}

function showWindow(el) {
    if (!el) return;
    el.classList.remove('closing');
    el.classList.add('show');
}

function hideWindow(el) {
    if (!el || !el.classList.contains('show')) return;

    el.classList.remove('show');
    el.classList.add('closing');

    window.setTimeout(() => {
        el.classList.remove('closing');
    }, 180);
}

function clampWindowPosition(el, left, top) {
    const width = el.offsetWidth || parseFloat(window.getComputedStyle(el).width) || 0;
    const height = el.offsetHeight || parseFloat(window.getComputedStyle(el).height) || 0;
    const maxLeft = Math.max(0, window.innerWidth - width);
    const maxTop = Math.max(0, window.innerHeight - height);

    return {
        left: Math.min(Math.max(0, left), maxLeft),
        top: Math.min(Math.max(0, top), maxTop),
    };
}

function setWindowPosition(el, left, top, options = {}) {
    if (!el) return;

    const { syncOffset = true } = options;
    const nextPosition = clampWindowPosition(el, left, top);

    el.style.left = nextPosition.left + 'px';
    el.style.top = nextPosition.top + 'px';

    if (syncOffset) {
        syncWindowOffset(el);
    }
}

function moveWindowsWithMainBox() {
    if (!mainBox) return;

    const mainBoxRect = mainBox.getBoundingClientRect();

    windows.forEach(win => {
        const offsetX = Number(win.dataset.offsetX);
        const offsetY = Number(win.dataset.offsetY);

        if (Number.isFinite(offsetX) && Number.isFinite(offsetY)) {
            setWindowPosition(win, mainBoxRect.left + offsetX, mainBoxRect.top + offsetY, { syncOffset: false });
            return;
        }

        syncWindowOffset(win);
    });
}

function positionSmallWindow(triggerBtn, popupWindow, offsets) {
    if (!triggerBtn || !popupWindow) return;

    const btnRect = triggerBtn.getBoundingClientRect();
    const popupWidth = parseFloat(getComputedStyle(popupWindow).width) || 250;
    const popupHeight = parseFloat(getComputedStyle(popupWindow).height) || 200;

    const margin = 8;
    let left = btnRect.right + offsets.x;
    let top = btnRect.top + offsets.y;

    const maxLeft = window.innerWidth - popupWidth - margin;
    const maxTop = window.innerHeight - popupHeight - margin;

    left = Math.min(Math.max(margin, left), maxLeft);
    top = Math.min(Math.max(margin, top), maxTop);

    setWindowPosition(popupWindow, left, top);
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
    const scrollLinks    = Array.from(win.querySelectorAll('[data-scroll-target]'));

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

    if (container && scrollLinks.length) {
        scrollLinks.forEach(link => {
            link.addEventListener('click', e => {
                const panel = link.closest('.aboutme1, .aboutme3');
                const target = win.querySelector('#' + link.dataset.scrollTarget);

                if (!panel || !target) return;

                e.preventDefault();
                panel.scrollTo({
                    top: target.offsetTop - 8,
                    behavior: 'smooth',
                });
            });
        });
    }
}

function initMatchaSubtabs() {
    const groups = Array.from(document.querySelectorAll('[data-subtabs]'));

    groups.forEach(group => {
        const buttons = Array.from(group.querySelectorAll('.matcha-subtab-btn'));
        const panels = Array.from(group.querySelectorAll('.matcha-subtab-panel'));
        const scrollContainer = group.closest('.aboutme3');

        function syncScrollState(targetTab) {
            if (!scrollContainer) return;

            const disableScroll = targetTab === 'intro';
            scrollContainer.classList.toggle('no-scroll', disableScroll);

            if (disableScroll) {
                scrollContainer.scrollTop = 0;
            }
        }

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.subtab;

                buttons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.subtab === targetTab);
                });

                panels.forEach(panel => {
                    panel.classList.toggle('active', panel.dataset.subtab === targetTab);
                });

                syncScrollState(targetTab);
            });
        });

        const activeButton = group.querySelector('.matcha-subtab-btn.active');
        syncScrollState(activeButton ? activeButton.dataset.subtab : 'intro');
    });
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

    setWindowPosition(element, newLeft, newTop);
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
        showWindow(windowEl);
        bringToFront(windowEl);
    });
}

const tipBtn = document.querySelector('.tip');
if (tipBtn && tipWindow) {
    tipBtn.addEventListener('click', () => {
        positionSmallWindow(tipBtn, tipWindow, { x: -60, y: -212 });

        setActiveTab(tipWindow, 'tip');
        showWindow(tipWindow);
        bringToFront(tipWindow);
    });
}

const updateBtn = document.querySelector('.update');
if (updateBtn && updateWindow) {
    updateBtn.addEventListener('click', () => {
        positionSmallWindow(updateBtn, updateWindow, { x: -40, y: -210 });

        setActiveTab(updateWindow, 'updates');
        showWindow(updateWindow);
        bringToFront(updateWindow);
    });
}

const wipBtn = document.querySelector('.wip1');
if (wipBtn && windowEk) {
    wipBtn.addEventListener('click', () => {
        setActiveTab(windowEk, 'matcha');
        showWindow(windowEk);
        bringToFront(windowEk);
    });
}

const wip2Btn = document.querySelector('.wip2');
if (wip2Btn && windowEk) {
    wip2Btn.addEventListener('click', () => {
        setActiveTab(windowEj, 'random');
        showWindow(windowEj);
        bringToFront(windowEj);
    });
}

windows.forEach(win => {
    initWindow(win);
    makeDraggable(win);
    win.addEventListener('mousedown', () => bringToFront(win));
    syncWindowOffset(win);
});

initMatchaSubtabs();
moveWindowsWithMainBox();

window.addEventListener('resize', moveWindowsWithMainBox);


// close the window on click of an x button
document.addEventListener('click', e => {
    const win = e.target.closest('.bomboclaat');
    if (e.target.closest('.close') && win) {
        hideWindow(win);
    }
});
