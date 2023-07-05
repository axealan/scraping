const express = require('express');
const puppeteer = require('puppeteer');

const TARGET = 'https://backoffice.minesbet.com/';
const app = express();
const port = 3000;

let result = '';

async function scrapData(req) {

 //sandbox
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });


  
  const email = req.query.email || 'teste@teste.com';
  const password = req.query.password || '123456';
  const player = req.query.player || 'adsteinhauser@gmail.com';
  const dateFrom = req.query.dateFrom || '2023-06-01';
  const dateTo = req.query.dateTo || '2023-06-17';
  const period = req.query.period || 'date';

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${TARGET}login`);
  await page.setViewport({ width: 1080, height: 1024 });
  await page.waitForSelector('.form');

  await page.evaluate((email, password) => {
    document.querySelector('input[name="email"]').value = email;
    document.querySelector('input[type="password"]').value = password;
    document.querySelector('button').click();
  }, email, password);

  const danger = await page.waitForSelector('.alert-danger', { timeout: 1000 })
    .then(() => true)
    .catch(() => false);

  if (danger) {
    await browser.close();
    result = 'Erro ao fazer login';
  } else {
    await page.waitForNavigation();
    result = await openReport(browser, page, player, dateFrom, dateTo, period);
  }

  await browser.close();
}

async function openReport(browser, page, player, dateFrom, dateTo, period) {
  await page.goto(`${TARGET}admin/affiliates/19/players?player=${player}&dateFrom=${dateFrom}&dateTo=${dateTo}&list=&period=${period}`);
  await page.setViewport({ width: 1080, height: 1024 });
  await page.waitForSelector('.table.table-striped');

  const report = await page.evaluate(() => {
    const tdElements = Array.from(document.querySelectorAll('.table.table-striped tbody td'));
    const player = tdElements.map(td => td.textContent.trim());

    return JSON.stringify(player);
  });

  return report;
}

app.get('/', async (req, res) => {
  await scrapData(req);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
