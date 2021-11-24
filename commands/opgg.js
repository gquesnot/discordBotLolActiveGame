const PuppeteerNetworkMonitor = require("../lib/puppeteernetworkmonitor");
const puppeteer = require('puppeteer');
const {unlink} = require("fs/promises");
const {MessageEmbed} = require("discord.js");
const {MessageAttachment} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');
const {Summoner} = require("../db");

function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('opgg')
        .setDescription('check opgg live match'),
    async execute(interaction) {
        await interaction.reply("loading ...")
        let summoner = await Summoner.findOne({where: {discordId: interaction.user.id}})
        if (summoner) {
            if (summoner.region === "euw") {
                const browser = await puppeteer.launch({
                    headless: true, // The browser is visible
                });
                const page = await browser.newPage();
                await page.setViewport({width: 1920, height: 1080});
                await page.goto('https://euw.op.gg/summoner/spectator/userName=' + summoner.summonerName);
                await page.setRequestInterception(true);

                let monitorRequests = new PuppeteerNetworkMonitor(page);
                await monitorRequests.waitForAllRequests()


                await delay(500)
                let error = await page.$('.SpectatorError')
                if (error){

                    await interaction.followUp("not in game");
                }
            else{
                    await page.evaluate(() => {
                        window.scrollTo(0, window.innerHeight - 50)
                    });
                    let fileName = makeId(10) + ".png";
                    let path = "img/" + fileName;
                    await page.screenshot({path: path,clip: {
                            x: 460,
                            y: 500,
                            width:1000,
                            height: 455
                        }});

                    const file = new MessageAttachment(path);
                    const exampleEmbed = {
                        title: 'Live Game',
                        image: {
                            url: 'attachment://' + fileName,
                        },
                    };

                    await interaction.followUp({embeds: [exampleEmbed], files: [file]});
                }

                await browser.close();

            }

        } else {
            await interaction.followUp("not registred use /set_summoner before");
        }
    },
};
