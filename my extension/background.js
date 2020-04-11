class dataSync {
  constructor(confirmed, deaths, recovered) {
    this.confirmed = confirmed;
    this.deaths = deaths;
    this.recovered = recovered;
  }
}

const getDataFromArray = (array, countryCode) => {
  for (let index = 0; index < array.length; index++) {
    if (array[index].country_code == countryCode) {
      return array[index].latest;
    }
  }
}

const updateDataWorld = (data) => {
  let world = new dataSync (
    data.confirmed.latest,
    data.deaths.latest,
    data.recovered.latest
  )
  chrome.storage.local.set({
    world: world
  }, () => {

  });
}

const updateDataCountry = (data) => {
  chrome.storage.sync.get("location", (e) => {
    let country = new dataSync (
      getDataFromArray(data.confirmed.locations, e.location.countryCode),
      getDataFromArray(data.deaths.locations, e.location.countryCode),
      getDataFromArray(data.recovered.locations, e.location.countryCode)
    )
    chrome.storage.local.set({
      country: country
    }, () => {
    })
  })
}

const updateData = (data) => {
  updateDataWorld(data);
  updateDataCountry(data);
}

const getDataAsync = async() => {
  const fetchURL = "https://coronavirus-tracker-api.herokuapp.com/all"
  let res = await fetch(
    "" +fetchURL+ "", {
      method: "GET",
    }
  );
  res = await res.json();
  return res;
}

const firstRun = async() => {
  const requestUrl = "http://ip-api.com/json";
  let res = await fetch(
    "" +requestUrl+ "", {
      method: "GET",
    }
  );
  res = await res.json();
  chrome.storage.sync.set({
    location: res
  }, () => {})
  chrome.storage.sync.set({autoLocate: true}, () => {
  })
  const data = await getDataAsync();
  updateData(data);
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    firstRun();
  } else if(details.reason == "update") {
  }
});