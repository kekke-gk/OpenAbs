class arXiv {
  static isMatch(url) {
    const regex = /^https:\/\/arxiv\.org\/.*\.pdf$/gs;
    return regex.exec(url) !== null;
  }

  static conv2abs(url) {
    const regex = /\d+\.\d+/gs;
    const id = regex.exec(url)[0];
    return `https://arxiv.org/abs/${id}`;
  }
}

class CVF {
  static isMatch(url) {
    const regex = /^https:\/\/openaccess\.thecvf\.com\/.*\.pdf$/gs;
    return regex.exec(url) !== null;
  }

  static conv2abs(url) {
    const regex = /openaccess.thecvf.com\/(.*?)\/papers\/(.*?)\.pdf$/gs;
    const ids = regex.exec(url).slice(1);
    return `https://openaccess.thecvf.com/${ids[0]}/html/${ids[1]}.html`;
  }
}

const sites = [arXiv, CVF];

function openAbstractAsNewTab(url, tabIndex) {
  console.log(url);

  for (const site of sites) {
    if (site.isMatch(url)) {
      console.log("OpenAbs: match", site.name);

      chrome.tabs.create({
        url: site.conv2abs(url),
        index: tabIndex + 1,
      });

      break;
    }
  }
}

function clickHandler(tab) {
  openAbstractAsNewTab(tab.url, tab.index);
}

chrome.action.onClicked.addListener(clickHandler);

function setIcon(url) {
  for (const site of sites) {
    if (site.isMatch(url)) {
      chrome.action.setIcon({ path: "images/icon128.png" });
      return;
    }
  }
  chrome.action.setIcon({ path: "images/icon128_inactive.png" });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let url = tabs[0].url;
    setIcon(url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = tab.url;
  setIcon(url);
});

function contextMenuClickHandler(info, tab) {
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions).then((tabs) => {
    const tab = tabs[0];
    openAbstractAsNewTab(tab.url, tab.index);
  });
}

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("contextMenuTitle"),
  id: "openabsmenu",
  contexts: ["frame"],
});

chrome.contextMenus.onClicked.addListener(contextMenuClickHandler);
