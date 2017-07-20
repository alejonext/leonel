'use strict'
const Promise = require('bluebird')
const moment = require('moment')
const ical = require('ical')
const debug = require('debug')('bot:invite')
const logError = require('debug')('bot:error')
const config = require('./config')

moment.locale('es')

function getCalendar (where) {
  return new Promise((resolve, reject) => {
    ical.fromURL(where, {}, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function calendar (bot, message) {
  debug('begin', message)
  var channel = false

  if (Array.isArray(message.data)) {
    channel = new RegExp(message.data[0], 'i')
  }

  return getCalendar(config.CALENDAR)
    .then(data => {
      debug('events', data)
      var now = moment()
      var future = []
      for (let i in data) {
        if (data[i].start && moment(data[i].start).diff(now) > 0 && (!channel || data[i].summary.test(channel))) {
          future.push(moment('- ' + data[i].start).toNow(true) + data[i].summary + ' en ' + data[i].location)
        }
      }
      debug('events:filter', future)
      return future
    })
    .then(events => {
      if (events && !events.length) {
        events.push('Upsss... No encontramos ningun evento!')
      }

      events.push('Aqui estan todos http://tiny.cc/CalendarioEventos')
      return bot.reply(message, events.join('\n'))
    })
    .catch(err => {
      debug('catch')

      if (err.message) {
        logError('caught', err.message)
        return bot.reply(message, err.message)
      }

      return bot.reply(message, 'Miercoles.... No sabes que paso')
    })
}

module.exports = calendar
