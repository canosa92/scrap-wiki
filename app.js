
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap');
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);

      let musicosUrl = [];

      // Encuentra los enlaces dentro del ID #mw-pages
      $('#mw-pages a').each((index, element) => {
        const musicoslink = $(element).attr('href');
        musicosUrl.push(`https://es.wikipedia.org${musicoslink}`);
      });

      console.log(musicosUrl)

      const promesas = musicosUrl.map(async (url) => {
        const paginaMusico = await axios.get(url);
        const musico$ = cheerio.load(paginaMusico.data);
        const title = musico$('title').text();
        const img = musico$('.mw-file-element').attr('src');
        const text =musico$('p:first').text();
      
        return { title,img,text }
       
      });

      const musicosData = await Promise.all(promesas);
      const htmlMusico = musicosData.map((musico) => 
      `<div class='card'><h2>${musico.title}</h2><img src='${musico.img}'><p>${musico.text}</p></div>`
      ).join('');
      /*res.send(`<style>#app {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 10px; 
        padding: 10px;
      }
      .card {
        width: 250px;
        min-height: 100px; 
        padding: 5px 10px;
        border: 2px solid rgb(116, 116, 116);
        border-radius: 5px;
        overflow: hidden;
        align-self: flex-start; 
      }
      </style>
      <div id="app"> ${htmlMusico} </div>`
      );*/
      //Necesito verlo en Html
     res.json(musicosData)
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});

app.listen(3001, () => {
  console.log('Express server listening http://localhost:3001');
});
