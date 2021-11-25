const PuppeteerNetworkMonitor = require("../lib/puppeteernetworkmonitor");
const puppeteer = require('puppeteer');
const fs = require("fs");
const {makeId} = require("../lib/util");
const {delay} = require("../lib/util");
const {unlink} = require("fs/promises");
const {MessageEmbed} = require("discord.js");
const {MessageAttachment} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');
const {Summoner} = require("../db");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('opgg')
        .setDescription('check opgg live match'),
    async execute(interaction) {
        let summoner = await Summoner.findOne({where: {discordId: interaction.user.id}})



        for (const file of fs.readdirSync("img")) {
            await unlink("img/"+file);
        }
        if (summoner) {
            if (summoner.region === "euw") {
                let url = 'https://euw.op.gg/summoner/spectator/userName=' + summoner.summonerName
                await interaction.reply(url)
                const browser = await puppeteer.launch({
                    headless: true, // The browser is visible
                    args: ['--no-sandbox'],
                });
                const page = await browser.newPage();
                await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 2});

                await page.goto(url);
                await page.setRequestInterception(true);

                await delay(500)
                let error = await page.$('.SpectatorError')
                if (error){

                    await interaction.followUp("not in game");
                }
                else{
                    await page.evaluate(() => {
                        window.scrollTo(0, window.innerHeight - 50)
                    });
                    let fileName = makeId(10) + ".jpg";
                    let path = "img/" + fileName;
                    await page.screenshot({path: path,quality:60,clip: {
                            x: 460,
                            y: 500,
                            width:1000,
                            height: 455
                        }});

                    const file = new MessageAttachment(path);
                    const embed = {
                        title: 'Live Game',
                        image: {
                            url: 'attachment://' + fileName,
                        },
                    };


                    await interaction.followUp({embeds: [embed], files: [file]});
                }

                await browser.close();

            }

        } else {
            await interaction.followUp("not registred use /set_summoner before");
        }
    },
};
