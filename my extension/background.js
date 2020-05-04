class dataSync {
  constructor(confirmed, deaths, recovered) {
    this.confirmed = confirmed;
    this.deaths = deaths;
    this.recovered = recovered;
  }
}

const init = () => {
  let world = new dataSync (0, 0, 0)
  chrome.storage.local.set({
    world: world
  }, () => {

  });
  let country = new dataSync (0, 0, 0)
  chrome.storage.local.set({
    country: country
  }, () => {
  });
}

chrome.runtime.onInstalled.addListener( (details) => {
  if (details.reason == "install") {
    const e = true;
    try {
      chrome.storage.sync.set({autoLocate: e}, () => {});
    } catch (error) {
      console.log(error);
    }
  } else if(details.reason == "update") {
  }
});