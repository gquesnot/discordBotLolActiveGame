const PuppeteerNetworkMonitor = require("../lib/puppeteernetworkmonitor");
const puppeteer = require('puppeteer');
const fs = require("fs");
const {makeId} = require("../lib/util");
const {unlink} = require("fs/promises");
const {MessageEmbed} = require("discord.js");
const {MessageAttachment} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');
const {Summoner} = require("../db");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('porofessorgg')
        .setDescription('check porofessorgg live match'),
    async execute(interaction) {
        let summoner = await Summoner.findOne({where: {discordId: interaction.user.id}})


        for (const file of fs.readdirSync("img")) {
            await unlink("img/"+file);
        }
        if (summoner) {
            if (summoner.region === "euw") {
                let url = 'https://porofessor.gg/live/euw/' + summoner.summonerName
                await interaction.reply(url)
                const browser = await puppeteer.launch({
                    headless: true, // The browser is visible
                    args: ['--no-sandbox'],
                });

                const page = await browser.newPage();
                await page.setRequestInterception(true)
                page.on('request', (request) => {
                    const headers = request.headers();
                    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0';
                    request.continue({
                        headers
                    });
                });
                await page.setViewport({width: 1920, height: 1080, deviceScaleFactor:2});
                let request = await page.goto(url)
                try {
                    let toFind = await page.waitForSelector("#liveContent > div.site-content.site-content-bg > ul:nth-child(3)", {
                        timeout: 5000
                    })

                    //await page.evaluate( () => {
                    //    document.getElementById('ncmp__tool').style.setProperty("display", "none");
                    //})
                    let fileName = makeId(10) + ".jpg";
                    let path = "img/" + fileName;

                    await page.screenshot({path: path,quality: 60,clip: {
                            x: 350,
                            y: 200,
                            width:1225,
                            height: 1500
                        }});

                    const file = new MessageAttachment(path);
                    const embed = {
                        title: 'Live Game',
                        image: {
                            url: 'attachment://' + fileName,
                        },
                    };


                    await interaction.followUp({embeds: [embed], files: [file]});
                } catch (e) {

                    await interaction.followUp("not in game");
                }


                //await browser.close();

            }

        } else {
            await interaction.reply("not registred use /set_summoner before");
        }
    },
};
