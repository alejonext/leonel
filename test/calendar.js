// = require modules
const test = require('ava')
const calendar = require('../lib/calendar')
const nock = require('nock')
const moment = require('moment')

// = require test helpers
const BotHelper = require('./helpers/bot')
const StorageHelper = require('./helpers/storage')
const MessageHelper = require('./helpers/message')

test.beforeEach(t => {
  let channel = 'Medellinjs'

  // initialize helpers
  let storage = new StorageHelper()
  let bot = new BotHelper({ storage })
  let message = new MessageHelper({
    user: 'userID',
    match: [`calendario de #${channel}`, `${channel}`]
  })
  let teamName = process.env.SLACK_TEAM_NAME || 'colombia-dev'
  let slack = nock(`https://${teamName}.slack.com`)
    .post('/api/users.admin.calendar')

  // setup user stubbed data
  let createdAt = moment().subtract(100, 'days')
  let hostData = {
    id: message.user,
    invites: 3,
    createdAt
  }

  // export context
  t.context = {
    slack,
    bot,
    message,
    createdAt,
    hostData
  }
})

test('No results', (t) => {
  t.plan(1)
  let channel = 'NoExisteCanal'
  let { bot, message } = t.context
  message.match = [`calendario de #${channel}`, `${channel}`]
  return calendar(bot, message).then(() => {
    console.log(t)
  })
})

test('Results #medellinjs', (t) => {
  t.plan(2)
  let channel = 'medellinjs'
  let { bot, message } = t.context
  message.match = [`calendario de #${channel}`, `${channel}`]
  return calendar(bot, message).then(() => {
    console.log(t)
  })
})

test('All in calendar', (t) => {
  t.plan(3)
  let { bot, message } = t.context
  message.match = [ 'calendario' ]
  return calendar(bot, message).then(() => {
    console.log(t)
  })
})
