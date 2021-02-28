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
    switch (args[0]) {
      case 'reload':
        if (!hasPermission(msg)) {
          msg.channel.send("You don't have permission to reload the tags database. (You need `tags` role)")
          break
        }
        try {
          await reloadTags()
          msg.channel.send('Tag reload successful.')
        } catch (err) {
          msg.channel.send('Tag reload failed.')
        }
        break
      case 'list':
        getTags().then(res => msg.channel.send(res))
        break
      default:
        msg.channel.send(
          '* `?tags reload` to reload the tags' +
         '\n* `?tags list` to list all tags' +
          '\n* `?[tag]` to use a tag')
        break
    }
  } else {
    if (!msg.content.startsWith('?')) return
    if (tags[msg.content.substring(1)]) {
      msg.channel.send(tags[msg.content.substring(1)].message)
    }
  }
})

async function getTags () {
  const text = Object.entries(tags)
  for (let i = 0; i < text.length; i++) {
    text[i] = `${i + 1}. \`?${text[i][0]}\``
  }
  return text.join('\n')
}

function hasPermission (msg) {
  return msg.member.roles.cache.some(role => role.name === 'tags')
}

async function reloadTags () {
  const fetched = await fetch(process.env.JSONURL)
  tags = await fetched.json()
}

client.login(process.env.TOKEN)
