const { SlashCommandBuilder } = require('@discordjs/builders');
const {Summoner} = require("../db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set_summoner')
		.setDescription('register your summoner')
		.addStringOption(option =>
			option.setName('summoner_name')
				.setDescription("summoner Name")
				.setRequired(true))
		.addStringOption(option =>
			option.setName('region')
				.setDescription("region name")
				.setRequired(true)
		),
	async execute(interaction) {
		console.log()

		let summoner = await Summoner.findOne({where:{discordId: interaction.user.id}})
		let discordId = interaction.user.id
		let summonerName = interaction.options.getString("summoner_name")
		let region= interaction.options.getString("region")
		if (summoner){
			Summoner.update({region: region, summonerName: summonerName}, {where:{discordId: discordId}});

		}
		else{
			summoner = await Summoner.create({
				discordId: discordId,
				summonerName: summonerName,
				region: region
			});

		}
		let result = "";
		result += "region set "+interaction.options.getString('region')
		await interaction.reply(result);
	},
};
