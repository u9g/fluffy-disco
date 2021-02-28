require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const tags = require('./tags.json')
const fs = require('fs').promises

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (msg) => {
  if (msg.content.startsWith('?tag') || msg.content.startsWith('?tags')) {
    const [, ...args] = msg.content.split(' ')
    switch (args[0]) {
      case 'make':
        if (!hasPermission(msg)) {
          msg.channel.send("You don't have permission to modify the tags database. (You need `tags` role)")
          break
        } else if (tags[args[1]]) {
          msg.channel.send(`Tag already exists, use \`?tag delete ${args[1]}\` first to reuse this tag name.`)
          break
        } else if (args[1] === 'tag' || args[1] === 'tags') {
          msg.channel.send('Invalid tag, try again with a different tag name.')
          break
        } else if (!args[2]) {
          msg.channel.send(`A tag needs a message, rerun the command with a message: \`?tag make ${args[1]} [message here]\``)
          break
        }
        await makeTag(args, msg)
        msg.channel.send('Tag made successfully!')
        break
      case 'delete':
      case 'del':
        if (!hasPermission(msg)) {
          msg.channel.send("You don't have permission to modify the tags database. (You need `tags` role)")
          break
        }
        await delTag(args)
        msg.channel.send('Tag deleted successfully')
        break
      case 'list':
        getTags().then(res => msg.channel.send(res))
        break
      default: // ?tag help
        msg.channel.send(
          '* `?tag make [name] [msg]` to make a tag' +
        '\n* `?tag del[ete] [name]` to delete a tag' +
         '\n* `?tag list` to list all tags' +
          '\n* `?[tag]` to use a tag')
        break
    }
  } else {
    if (!msg.content.startsWith('?')) return
    const tagMessage = getTag(msg.content.substring(1))
    msg.channel.send(tagMessage)
  }
})

async function getTags () {
  const text = Object.entries(tags)
  for (let i = 0; i < text.length; i++) {
    const user = await client.users.fetch(text[i][1].createdBy)
    text[i] = `${i + 1}. \`?${text[i][0]}\` by ${user.username}`
  }
  return text.join('\n')
}

function hasPermission (msg) {
  return msg.member.roles.cache.some(role => role.name === 'tags')
}

function getTag (name) {
  return tags[name].message
}

async function makeTag (args, msg) {
  let [, tagName, ...tagMessage] = args
  tagMessage = Discord.escapeMarkdown(tagMessage.join(' '))
  tags[tagName] = {
    message: tagMessage,
    createdBy: msg.author.id,
    createdDate: Date.now()
  }
  await save()
}

async function delTag (args) {
  const [, tagName] = args
  delete tags[tagName]
  await save()
}

async function save () {
  await fs.writeFile('./tags.json', JSON.stringify(tags, null, 2))
}

client.login(process.env.TOKEN)
