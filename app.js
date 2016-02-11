var express = require("express");
var app = express();
var bp = require("body-parser");
app.use(bp.urlencoded({ extended: true }));
var fs = require("fs");
var wol = require("wake_on_lan")
var conf;
try {
	var conf = JSON.parse(fs.readFileSync("config.json", "utf8"));
} catch(e) {
	conf = {
		port: 8080,
		clients: []
	}
  updateConf();
  console.log("Created config file! Starting on port %d", conf.port)
}

app.listen(conf.port);

app.use(express.static("static"))

app.get("/clients", function(req, res) {
	res.json(conf.clients);
});

app.post("/add", function(req, res) {
  var mac = req.body.mac;
  var name = req.body.name;
	var index = findByMac(mac);
  console.log(index);
  if(index !== false) {
    res.send({ err: "E_CLIENT_EXISTS" });
  } else {
    conf.clients.push({ mac: mac, name: name });
    updateConf();
    res.json(conf.clients);
  }
});

app.post("/remove", function(req, res) {
	var mac = req.body.mac;
  var index = findByMac(mac);
  console.log(index+":"+mac);
  if(index !== false) {
    conf.clients.splice(index, 1);
    updateConf();
    res.json(conf.clients);
  } else {
    res.send({ err: "E_CLIENT_NOT_EXIST" });
  }
});

app.post("/wake", function(req, res) {
  var mac = req.body.mac;
  var index = findByMac(mac);
  if(index === false) {
    res.send({ err: "E_CLIENT_NOT_EXIST" });
    return;
  }
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
    if(conf.clients[i].mac == mac) {
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
