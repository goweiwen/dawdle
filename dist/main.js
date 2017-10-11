'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _nodeTelegramBotApi = require('node-telegram-bot-api');

var _nodeTelegramBotApi2 = _interopRequireDefault(_nodeTelegramBotApi);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaBody = require('koa-body');

var _koaBody2 = _interopRequireDefault(_koaBody);

var _koaViews = require('koa-views');

var _koaViews2 = _interopRequireDefault(_koaViews);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOKEN = process.env.TELEGRAM_TOKEN;
var GAME_NAME = process.env.TELEGRAM_GAMENAME;
var url = process.env.URL;
var PORT = process.env.PORT || 3000;

var bot = new _nodeTelegramBotApi2.default(TOKEN, { polling: true });

bot.on('inline_query', function (inlineQuery) {
  return bot.answerInlineQuery(inlineQuery.id, [{
    type: 'game',
    id: url,
    game_short_name: GAME_NAME
  }]);
});

bot.on('callback_query', function (callbackQuery) {
  bot.answerCallbackQuery({
    callback_query_id: callbackQuery.id,
    text: GAME_NAME,
    url: url + '/' + callbackQuery.from.id + '/' + callbackQuery.inline_message_id
  });
});

if (url == null) {
  _promise2.default.resolve().then(function () {
    return require('ngrok');
  }).then(function (ngrok) {
    return ngrok.connect(PORT, function onConnect(err, u) {
      if (err) throw err;
      url = u;
      console.log('Game tunneled at ' + url);
    });
  });
}

var app = new _koa2.default();
var router = new _koaRouter2.default();

app.use((0, _koaBody2.default)());
app.use((0, _koaViews2.default)(_path2.default.join(__dirname, 'views')));

// Serve game page
router.get('/:userId/:inlineMessageId', function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return ctx.render('game');

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

// Fetch highscore
router.get('/:userId/:inlineMessageId/score', function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx) {
    var _ctx$params, userId, inlineMessageId, highscores, score, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, highscore;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _ctx$params = ctx.params, userId = _ctx$params.userId, inlineMessageId = _ctx$params.inlineMessageId;
            _context2.next = 3;
            return bot.getGameHighScores(userId, { inline_message_id: inlineMessageId });

          case 3:
            highscores = _context2.sent;
            score = 0;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 8;

            for (_iterator = (0, _getIterator3.default)(highscores); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              highscore = _step.value;

              if (highscore.user.id === parseInt(userId)) {
                score = highscore.score;
              }
            }

            _context2.next = 16;
            break;

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2['catch'](8);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 16:
            _context2.prev = 16;
            _context2.prev = 17;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 19:
            _context2.prev = 19;

            if (!_didIteratorError) {
              _context2.next = 22;
              break;
            }

            throw _iteratorError;

          case 22:
            return _context2.finish(19);

          case 23:
            return _context2.finish(16);

          case 24:
            ctx.response.body = score;

          case 25:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[8, 12, 16, 24], [17,, 19, 23]]);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}());

// Submit highscore
router.post('/:userId/:inlineMessageId', function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx) {
    var _ctx$params2, userId, inlineMessageId, score;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _ctx$params2 = ctx.params, userId = _ctx$params2.userId, inlineMessageId = _ctx$params2.inlineMessageId;
            score = ctx.request.body.score;


            bot.setGameScore(userId, score, { force: true, inline_message_id: inlineMessageId });

          case 3:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x3) {
    return _ref3.apply(this, arguments);
  };
}());

app.use(router.routes());

app.listen(PORT, function () {
  return console.log('Server is listening at http://localhost:' + PORT);
});