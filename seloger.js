let http = require("http");
var parser = require('xml2json');


const urlMaisonFerney = "http://ws.seloger.com/search.xml?idtt=1&ci=10160&idtypebien=2,13,14&nb_pieces=4,+5,all&surfacemin=100";
//const urlMaisonFerney = "http://ws.seloger.com/search.xml?idtt=1&ci=10160";

function loadEntries() {
    return new Promise(function(resolve, reject) {   
        http.get(urlMaisonFerney, (response) => {
            // Continuously update stream with data
            let body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
    
                // Data reception is done, do whatever with it!
                //var parsed = JSON.parse(body);
                resolve(body);
            });
        });
    });
}

function makeEntry(x) {
    return {
        origin: "seloger.com",
        origin_id: x.idAnnonce,
        title: x.titre,
        desc: x.descriptif,
        price: x.prix + " "+ x.prixUnite + " " + x.prixMention,
        area: x.surface + " " + x.surfaceUnite,
        location: x.cp+" "+x.ville,
        pic: x.firstThumb
    };
}

module.exports = {
    getEntries: async () => {
        let body = await loadEntries();

        let result = parser.toJson(body, {object: true});

        if (result.recherche.annonces.annonce === undefined)
            return [];
        else if (Array.isArray(result.recherche.annonces.annonce)) {
            return result.recherche.annonces.annonce.map(x=>makeEntry(x));
        }
        else 
            return [makeEntry(result.recherche.annonces.annonce)];
    }
}