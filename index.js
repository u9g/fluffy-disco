require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const fetch = require('node-fetch')
let tags = null

client.on('ready', async () => {
  await reloadTags()
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (msg) => {
  if (msg.content.startsWith('?tags')) {
    const [, ...args] = msg.content.split(' ')
    const [subCommand] = args

    if (subCommand === 'reload') {
      if (hasPermission(msg)) {
        try {
          await reloadTags()
          setTimeout(reloadTags, 15 * 60 * 1000)

          msg.channel.send('Tag reload successful.')
        } catch (err) {
          msg.channel.send('Tag reload failed.')
        }
      } else msg.channel.send("You don't have permission to reload the tags database. (You need `tags` role)")
    } else if (subCommand === 'list') msg.channel.send(await getTags())
    else msg.channel.send(tags.help)
  } else {
    if (!msg.content.startsWith('?')) return
    if (tags[msg.content.substring(1)]) {
      const tag = tags[msg.content.substring(1)]
      msg.channel.send(tag)
    }
  }
})

async function getTags () {
  return Object.keys(tags)
    .map((cmdName, i) => `${i + 1}. \`?${cmdName}\``)
    .join('\n')
}

function hasPermission (msg) {
  return msg.member.roles.cache.some(role => role.name === 'tags')
}

async function reloadTags () {
  tags = await (await fetch(process.env.JSONURL)).json()
}

client.login(process.env.TOKEN)
