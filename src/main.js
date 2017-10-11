import TelegramBot from 'node-telegram-bot-api'
import Koa from 'koa'
import Router from 'koa-router'
import body from 'koa-body'
import views from 'koa-views'
import ngrok from 'ngrok'
import path from 'path'

const TOKEN = process.env.TELEGRAM_TOKEN
const GAME_NAME = process.env.TELEGRAM_GAMENAME
let url = process.env.URL
const PORT = process.env.PORT || 3000

const bot = new TelegramBot(TOKEN, { polling: true })

bot.onText(/\/start/, msg => bot.sendGame(msg.chat.id, GAME_NAME))

bot.on('message', msg => console.log(`@${msg.from.username}: ${msg.text}`))

bot.on('inline_query', inlineQuery =>
  bot.answerInlineQuery(inlineQuery.id, [{
    type: 'game',
    id: url,
    game_short_name: GAME_NAME
  }])
)

bot.on('callback_query', callbackQuery => {
  console.log(`${url}/${callbackQuery.from.id}/${callbackQuery.inline_message_id}`)
  bot.answerCallbackQuery({
    callback_query_id: callbackQuery.id,
    text: GAME_NAME,
    url: `${url}/${callbackQuery.from.id}/${callbackQuery.inline_message_id}`
  })
})

if (url == null) {
  ngrok.connect(PORT, function onConnect (err, u) {
    if (err) throw err
    url = u
    console.log(`Game tunneled at ${url}`)
  })
}

const app = new Koa()
const router = new Router()

app.use(body())
app.use(views(path.join(__dirname, 'views')))

// Serve game page
router.get('/:userId/:inlineMessageId', async ctx => { await ctx.render('game.pug') })

// Fetch highscore
router.get('/:userId/:inlineMessageId/score', async ctx => {
  const { userId, inlineMessageId } = ctx.params
  const highscores = await bot.getGameHighScores(userId, { inline_message_id: inlineMessageId })

  let score = 0
  for (let highscore of highscores) {
    if (highscore.user.id === parseInt(userId)) {
      score = highscore.score
    }
  }

  ctx.response.body = score
})

// Submit highscore
router.post('/:userId/:inlineMessageId', async ctx => {
  const { userId, inlineMessageId } = ctx.params
  const { score } = ctx.request.body

  bot.setGameScore(userId, score, { force: true, inline_message_id: inlineMessageId })
})

app.use(router.routes())

app.listen(PORT, () => console.log(`Server is listening at http://localhost:${PORT}`))
