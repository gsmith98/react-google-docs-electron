const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').User;
const Doc = require('./models').Doc;


mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', function(){
    console.log('successfully connected to database')
});
mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'keyboard cat',
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

/* PASSPORT SETUP */
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
/* END OF PASSPORT SETUP */


/* SOCKET SETUP */
io.on('connection', socket => {

  socket.on('join', ({docId}) => {
    const rooms = io.sockets.adapter.rooms;
    if (rooms[docId] && rooms[docId].length === 4) {
      socket.emit('roomFull');
      return;
    }

    socket.room = docId;
    socket.join(socket.room);

    if (rooms[socket.room].length === 1) {
      rooms[socket.room].colors = ['HIGHLIGHT4', 'HIGHLIGHT3', 'HIGHLIGHT2', 'HIGHLIGHT1'];
    }
    socket.color = rooms[socket.room].colors.pop();

    socket.broadcast.to(socket.room).emit('userJoined', socket.color);
    socket.emit('newColor', socket.color)
  });

  socket.on('contentUpdate', newContent => {
    socket.broadcast.to(socket.room).emit('contentUpdate', newContent);
  });

  socket.on('disconnect', () => {
    const theRoom = io.sockets.adapter.rooms[socket.room];
    if (theRoom) {
      theRoom.colors.push(socket.color);
    }
    socket.leave(socket.room);
  })

  socket.emit('connectionReady');
});
/* END OF SOCKET SETUP */


/* AUTH ROUTES */
app.post('/register', (req, res) => {
  new User({
    username: req.body.username,
    password: req.body.password
  }).save(function(err,user){
    if(err){
      res.json({success: false, error: err});
    } else {
      res.json({success: true});
    }
  });
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({success: true, user: req.user})
});
/* END OF AUTH ROUTES */


app.get('/getuserdocuments', (req, res) => {
  req.user.populate('documents')
  .execPopulate()
  .then(populatedUser => {
    res.json({success: true, userDocs: populatedUser.documents});
  })
  .catch(err => {
    res.json({success: false, error: err});
  })
});

app.post('/newdocument', (req, res) => {
  const newDoc = new Doc({ title: req.body.title, owner: req.user.id });

  let docToSendBack;
  newDoc.save()
  .then((savedDoc) => {
    docToSendBack = savedDoc;
    return User.update({_id: req.user.id}, { $push: { documents: savedDoc.id }});
  })
  .then(() => {
    res.json({ success: true, newDoc: docToSendBack });
  })
  .catch((err) => {
    res.json({ success: false, error: err });
  })
});

app.post('/savedocument/:docId', (req, res) => {
  Doc.update({_id: req.params.docId}, {$set: {content: req.body.content}})
  .then(() => {
    res.json({ success: true });
  })
  .catch((err) => {
    res.json({ success: false, error: err });
  })
});

app.get('/getdocument/:docId', (req, res) => {
  Doc.findById(req.params.docId)
  .then(foundDoc => {
    res.json({ success: true, document: foundDoc });
  })
  .catch(err => {
    res.json({ success: false, error: err });
  })
});

app.get('/addshareddoc/:docId', (req, res) => {
  // To be fully correct, this route should also check that it isn't adding a duplicate
  User.update({_id: req.user.id}, { $push: { documents: req.params.docId }})
  .then(() => {
    res.json({ success: true });
  })
  .catch((err) => {
    res.json({ success: false, error: err });
  })
});


server.listen(3000, () => {
    console.log('Backend server for Electron App running on port 3000!')
});
