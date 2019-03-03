// Use puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs').promises;


// Set page
const GLOCALS = `https://www.glocals.com/classifieds/housing-and-real-estate/`;

extractEntry = (rawEntry) => {
    return {
        origin: "glocals.com",
        origin_id: rawEntry.id,
        title: rawEntry.title,
        desc: rawEntry.description,
        rooms: rawEntry.rooms,
        price: rawEntry.price + " " + rawEntry.currency,
        location: rawEntry.location + ", " +rawEntry.city,
        url: "",
        area: "",
        pic: "https://cdn.glocals.com/sites/glocals" + rawEntry.photo1
    }
}

extractEntries = (rawJson) => {
    let rawValue = JSON.parse(rawJson);
    return rawValue.classifieds.map(x => extractEntry(x));
}

getEntries = async () => {
  // Initiate the Puppeteer browser
  const browser = await puppeteer.launch({
    'args' : [
      '--no-sandbox',
      '--disable-setuid-sandbox'
  ],
  /*{devtools: true}*/
  });
  const page = await browser.newPage();
  
  // Go to page
  await page.goto(GLOCALS, { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    document.querySelector(`select#bl_flat_type:nth-child(1)`).selected = true;
  });
  await page.select(`select#bl_num_room_from`,"4");

  var jsonData = [];
  
  page.on('response', response => {
    if (response.url().endsWith("get_classified_flats"))
        //console.log("response code: ", response.url());
        // do something here
        response.text()
          .then(text => { fs.appendFile('rawdata.txt', text+"\n\n"); return text; })
          .then(text => { jsonData = jsonData.concat(extractEntries(text)); return text; })
          .then(text => { console.log(JSON.stringify(extractEntries(text),null,"\t") + "\n-----------------------------\n"); return text; })
          .catch(err => console.log("\nERROR: "+err+"\n\n"));
    });

  await page.click(`input[name='search[submit]']`);

  async function getData(page) {
    await page.waitForSelector(".classified_title_title");

    /* Run javascript inside of the page */
    let data = await page.evaluate(() => {
      let data = []; // Create an empty array
      let elements = document.querySelectorAll('.classified_div'); // Select all 
      for (var element of elements){ // Loop through each proudct
          let title = element.querySelector(".classified_title_title").innerText;
          let rooms = element.querySelector(".classified_rooms").innerText;
          let location = element.querySelector(".classified_location").innerText;
          
          // let price = element.childNodes[7].children[0].innerText; // Select the price

          //data.push({title, price});
          data.push({title, rooms, location});
      }
      return data; // Return our data array
    });

    //return data;
    return jsonData;
  }

  let data=[];
  
  let tmp=await getData(page);
  data=data.concat(tmp);

  while (true) {
    try {
      await page.waitForSelector(`.x-item-disabled .x-tbar-page-next`, {timeout: 2000});
      break;
    }
    catch (error) {
      await page.click(`.x-tbar-page-next`);
      let tmp=await getData(page);
      data=data.concat(tmp);
    }
    // only get one page...
    break;
  }

  // /* Outpitting what we scraped */
  // console.log(JSON.stringify(data));

  // console.log(jsonData);
  
  await browser.close();

  return data;
};

module.exports = {
    getEntries
}