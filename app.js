var app = require("express")();
var bp = require("body-parser");
app.use(bp.urlencoded({ extended: true }));
var fs = require("fs");
var wol = require("wake_on_lan")
var conf;
try {
	fs.readFileSync("config.json", "utf8");
} catch(e) {
	conf = {
		port: 8080,
		clients: [
			"00:00:00:00:00:00"
		]
	}
}

app.listen(conf.port);

app.get("/", function() {
	res.send(__dirname + "/index.html");
});

app.get("/clients", function(req, res) {
	res.json(conf.clients);
});

app.post("/add", function(req, res) {
  var mac = req.body.mac;
	var index = findByMac(mac);
  if(index) {
    res.send({ err: "E_CLIENT_EXISTS" });
  } else {
    conf.clients.push(mac);
    updateConf();
    res.sendStatus(200);
  }
});

app.post("/remove", function(req, res) {
	var mac = req.body.mac;
  var index = findByMac(mac);
  if(index) {
    conf.clients.splice(index, 1);
    updateConf();
  } else {
    res.send({ err: "E_CLIENT_NOT_EXIST" });
  }
});

app.post("/wake", function(req, res) {
  var mac = req.body.mac;
  wol.wake(mac, function(err) {
    if(err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
})

function findByMac(mac) {
  for(var i = 0 ; i < conf.clients.length; i++) {
    if(conf.clients[i] == mac) {
      return i;
    }
  }
  return false;
}

function updateConf() {
  try {
    fs.writeFileSync("config.json", JSON.stringify(conf, null, "\t"), "utf8");
  } catch(e) {
    console.log("could not write client list, please check write permissions and try again");
  }
}
