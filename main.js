const { app, BrowserWindow, Menu } = require('electron');
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({ width: 360, height: 720 });
  mainWindow.on('page-title-updated', (evt) => { evt.preventDefault(); });
  mainWindow.setTitle('たけのこ投票機');
  mainWindow.loadURL('https://www.meiji.co.jp/sweets/chocolate/kinotake/cmp/2019senkyo/')
  mainWindow.isMenuBarVisible = false;

  reloadAndClick();
  setInterval(update, 1000);
}

var nextClickDate = new Date();
const interval = 24 * 60 * 60 * 1000;

function update() {
  const now = new Date();
  const diff = nextClickDate.getTime() - now.getTime();
  if (diff <= 0) {
    reloadAndClick();
  } else {
    const hour = Math.floor(diff / (3600 * 1000));
    const min = Math.floor(diff / (60 * 1000)) % 60;
    const sec = Math.floor(diff / 1000) % 60;
    const timerText = `次回の投票は${hour}時間${min}分${sec}秒後です。`;
    const script = `
      {
        const timer = document.getElementById('timer');
        if (timer) {
          timer.textContent = '${timerText}';
        }
      }
    `;
    mainWindow.webContents.executeJavaScript(script);
  }
}

function reloadAndClick() {
  nextClickDate = new Date();
  nextClickDate.setMilliseconds(nextClickDate.getMilliseconds() + interval);
  mainWindow.reload();

  const script = `
  {
    const loader = document.querySelector('.loader');
    new MutationObserver(records => {
      if (records[0].target.style.display === 'none') {
        const timer = document.createElement('div');
        timer.textContent = '';
        timer.id = 'timer';
        timer.style.zIndex = 99999;
        timer.style.backgroundColor = 'red';
        timer.style.color = 'white';
        timer.style.fontSize = '14pt';
        timer.style.position = 'fixed';
        timer.style.right = 0;
        timer.style.top = 0;
        document.body.appendChild(timer);

        const btn = document.querySelector('.takenoko > .web');
        if (btn.disabled) {
          new Notification('すでに投票済みです。次回は24時間後です。');
        } else {
          btn.click();
          new Notification('たけのこ党に投票しました！次回は24時間後です。');
        }
      }
    }).observe(loader, { attributes: true, attributeFilter: ['style'] });
  }
  `
  mainWindow.webContents.executeJavaScript(script);
}

Menu.setApplicationMenu(null);
app.on('ready', createWindow);
app.on('window-all-closed', function () { app.quit(); });
