const express = require('express');
const puppeteer = require('puppeteer');

const TARGET = 'https://backoffice.minesbet.com/';
const app = express();
const port = 3000;

let result = '';

async function scrapData(email, password, player, dateFrom, dateTo, period) {
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
  const { email, password, player, dateFrom, dateTo, period } = req.query;
  await scrapData(email, password, player, dateFrom, dateTo, period);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
