const fs = require('fs').promises;
const glocals = require('./glocals.js');
const leboncoin = require('./leboncoin');
const seloger = require('./seloger');

 (async function() {
    data=[]

    //glocals.getEntries();
    //leboncoin.getEntries();

    let d=await seloger.getEntries();

    data=data.concat(d);
    data=data.concat(await glocals.getEntries());
        

    console.log(data);

    fs.writeFile("pub/data.js","loadData("+JSON.stringify(data,null,"\t")+");");
})();
