const puppeteer = require('puppeteer');
const express = require('express');

const app = express();

app.use(express.json());

const TARGET = 'https://backoffice.minesbet.com/';

app.post('/', async (req, res) => {
    const { email, password, player, dateFrom, dateTo, period } = req.body;

    if (!email || !password) {
        res.send('Email ou senha não encontrados');
        return;
    }

    try {
        const result = await simpleScrap(email, password, player, dateFrom, dateTo, period);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao executar o scraping');
    }
});

async function simpleScrap(email, password, player, dateFrom, dateTo, period) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`${TARGET}login`);

    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('.form');

    await page.evaluate((email) => {
        document.querySelector('input[name="email"]').value = email;
    }, email);

    await page.evaluate((password) => {
        document.querySelector('input[type="password"]').value = password;
    }, password);

    await page.evaluate(() => {
        document.querySelector('button').click();
    });

    const danger = await page.waitForSelector('.alert-danger', { timeout: 1000 })
        .then(() => true)
        .catch(() => false);

    if (danger) {
        const error = await page.evaluate(() => {
            const alert = document.querySelector('.alert');
            const ul = alert.querySelector('ul');
            const li = ul.querySelector('li');
            return li.innerText;
        });

        await browser.close();

        console.log('Erro ao fazer login');

        return {
            email: email,
            password: password,
            error: error
        };
    }

    await page.waitForNavigation();

    const response = await openReport(browser, page, player, dateFrom, dateTo, period);

    await browser.close();

    return response;
}

async function openReport(browser, page, player, dateFrom, dateTo, period) {
    await page.goto(`${TARGET}admin/affiliates/19/players?player=${player}&dateFrom=${dateFrom}&dateTo=${dateTo}&list=&period=${period}`);
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('.table');

    const report = await page.evaluate(() => {
        const table = document.querySelector('.table');

        let response = [];

        const thead = table.querySelector('thead');
        const ths = thead.querySelectorAll('th');
        const thsText = Array.from(ths).map(th => th.innerText);
        const tbody = table.querySelector('tbody');

        const trs = tbody.querySelectorAll('tr');
        Array.from(trs).forEach(tr => {
            const tds = tr.querySelectorAll('td');
            const tdsText = Array.from(tds).map(td => td.innerText);

            response.push(
                Object.fromEntries(tdsText.map((td, i) => [thsText[i], td]))
            );
        });

        return {
            player: player,
            dateFrom: dateFrom,
            dateTo: dateTo,
            period: period,
            report: response
        };
    });

    return report;
}

app.listen(3000, () => {
    console.log('Aplicação de exemplo ouvindo na porta 3000!');
});
