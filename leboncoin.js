const puppeteer = require('puppeteer');

var LEBONCOIN = "https://www.leboncoin.fr/recherche/?category=10&locations=Ferney-Voltaire_01210&real_estate_type=1"

module.exports = {
    getEntries: async () => {

        let browser = await puppeteer.launch({
            'headless':false,
        'args' : [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
        })

        const page = await browser.newPage();
        await page.goto(LEBONCOIN);
        await page.screenshot({path: 'example.png'});

        let data=await page.evaluate(()=>{
            let resultArray=Array.from(document.querySelectorAll('li[data-qa-id="aditem_container"]'));
            //console.log(resultArray);
            return (resultArray.map(x => x));//.querySelector("span[data-qa-id='aditem_title']")));
        })
        await page.screenshot({path: 'example2.png'});
        await browser.close();
        return data;
    }
}