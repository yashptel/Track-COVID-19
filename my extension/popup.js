const confirmed = document.querySelectorAll("#confirmed");
const deaths = document.querySelectorAll("#deaths");
const recovered = document.querySelectorAll("#recovered");

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const syncData = () => {
  chrome.storage.local.get("world", (e) => {
    setData(e.world, 0);
  })
  chrome.storage.local.get("country", (e) => {
    setData(e.country, 1);
  })
}

const setData = (latest, id) => {  
  confirmed[id].innerHTML = numberWithCommas(latest.confirmed);
  deaths[id].innerHTML = numberWithCommas(latest.deaths);
  recovered[id].innerHTML = numberWithCommas(latest.recovered);
}


const switchTab = (id) => {
  const container = document.querySelectorAll(".data-inner-container");
  container.forEach((element, idx) => {
    if (id === idx) {
      element.style.transform = "translateX(0px)";
    } else if (idx < id) {
      element.style.transform = "translateX(-20px)";
    } else {
      element.style.transform = "translateX(20px)";
    }
  });
}

const setActiveTab = (root, element, id) => {
  let tabPos;
  if (id === 0) {
    tabPos = "25%";
  } else if (id === 1) {
    tabPos = "75%";
  }
  root.style.setProperty("--tab-position", tabPos);
  element.classList.add("tab-active");
  const elementWidth = element.querySelector("span").clientWidth;
  root.style.setProperty("--tab-width", elementWidth+"px");
}

const setInactiveTab = (element) => {
  element.classList.remove("tab-active");
}

const setNumbers = (e, id) => {
  e[id].style.setProperty("opacity", 1);
  e[id].style.setProperty("visibility", "visible");
}

const unsetNumbers = (e, id) => {
  e[id].style.setProperty("opacity", 0);
  setTimeout(() => {
    e[id].style.setProperty("visibility", "hidden");
  }, 250);
}

const tabClicked = (tab, idx) => {
  const root = document.querySelector(":root");
  const dataInnerContainer = document.querySelectorAll(".data-inner-container");
  tab.forEach((element, id) => {
    if(id === idx) {
      setActiveTab(root, element, id);
      setNumbers(dataInnerContainer, id);
      switchTab(id);
    } else {
      setInactiveTab(element);
      unsetNumbers(dataInnerContainer, id);
    }
  });
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

const dataSet = () => {
  const number = document.querySelectorAll(".number");
    number.forEach(element => {
      element.style.animation = "blink 1.2s ease-in-out 0";
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
      syncData();
      dataSet();
    })
  })
}

const updateData = (data) => {
  updateDataWorld(data);
  updateDataCountry(data);
}



const newData = async () => {
  const data = await getDataAsync();
  updateData(data);
}
const getLocation = async (tab) => {
  chrome.storage.sync.get("location", async (e) => {
    if (e.location == null) {
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
    } 
    chrome.storage.sync.get("location", (e) => {
      tab[1].querySelector('span').innerHTML = e.location.country;
    })
  });
  chrome.storage.sync.get("autoLocate", async (e) => {
    if (e.autoLocate === true) {
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
    }
  })
}


(async function init() {
  const tab = document.querySelectorAll(".tab");
  await getLocation(tab);
  tab.forEach((element, idx) => {
    element.addEventListener("click", function() {
      tabClicked(tab, idx);
    })
  })
  tabClicked(tab, 0);
  syncData();
  newData();
})()