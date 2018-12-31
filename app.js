/****************************************************
 * Jaspal Bainiwal's
 * **************************************************/
 
var express = require('express');
var connect = require('./dbcon.js');
var mysql = require('mysql');
var app = express();
app.use(express.static('public'));
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var methodOverride = require('method-override');
app.use(methodOverride('_method'));


/****************************************************************
 * Index page
 * ****************************************************************/
 
function indexPos (req, res, next){
  connect.pool.query("SELECT * FROM position;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].position_id, "name": rows[x].position_name});
    }
    req.queryList = array;
	return next();
});
}

function indexTeam (req, res, next){
  connect.pool.query("SELECT * FROM current_team;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].team_id, "team": rows[x].team_name});
    }
    req.teamList = array;
    return next();
});
}

function indexNat (req, res, next){
  connect.pool.query("SELECT * FROM nationality;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].nationality_id, "nat": rows[x].country_name});
    }
    req.natList = array;
    return next();
});
}

function renderIndex(req, res){
  var context = {};
  context.queryList = req.queryList;
  context.teamList = req.teamList;
  context.natList = req.natList;
  res.render('index', context);
}

app.get('/', indexPos, indexTeam, indexNat, renderIndex);

/****************************************************************************
 * Players section with get, post, and add
 * *************************************************************************/
 
app.get('/players',function(req, res, next){
var context = {};
connect.pool.query("SELECT * FROM `player` LEFT JOIN position ON player_position = position.position_id LEFT JOIN current_team ON player_team = current_team.team_id LEFT JOIN nationality ON player_nat = nationality.nationality_id;", function(err, rows, fields){
       if(err){
      next(err);
      return;
    }
    var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].player_id, "fname" : rows[x].first_name, "lname" : rows[x].last_name, "goals": rows[x].goals, "assists": rows[x].assists, "saves": rows[x].saves, "salary": rows[x].salary, 
"cteam": rows[x].team_name, "position": rows[x].position_name, "nationality": rows[x].country_name});
    }
       context.queryList = array;
         res.render('players', context);
});
});

app.post('/addPlayer', function(req, res){
    var fname = req.body.fname;
    var lname = req.body.lname;
    var goals = req.body.goals;
    var assists = req.body.assists;
    var saves = req.body.saves;
    var salary = req.body.salary;
    var position = req.body.position;
    var team = req.body.cteam;
    var nat = req.body.nat;

  var sql = "INSERT INTO `player` (first_name, last_name, goals, assists, saves, salary, player_position, player_team, player_nat) VALUES (?,?,?,?,?,?,?,?,?);";
  var values = [fname, lname, goals, assists, saves, salary, position, team, nat];
  sql = mysql.format(sql, values);
  connect.pool.query(sql,function(){
  });
  res.redirect('/players');
});

app.delete('/player/:id', function(req, res){
  var id = req.params.id;
  var sql = "DELETE FROM player WHERE player_id = (?);";
  sql = mysql.format(sql, id);
  connect.pool.query(sql,function(){
    
  });
  res.redirect('/players');
});

app.get('/filterPlayer', function(req, res, next){
  var fname = req.query.fnamesearch;
  var lname = req.query.lnamesearch;
  var context = {};
  context.templatefname = fname;
  context.templatelname = lname;
  var sql = "SELECT * FROM `player` LEFT JOIN position ON player_position = position.position_id LEFT JOIN current_team ON player_team = current_team.team_id LEFT JOIN nationality ON player_nat = nationality.nationality_id WHERE first_name = (?) AND last_name = (?);";
  var values = [fname, lname];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(err, rows, fields){
       if(err){
      next(err);
      return;
    }
    var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].player_id, "fname" : rows[x].first_name, "lname" : rows[x].last_name, "goals": rows[x].goals, "assists": rows[x].assists, "saves": rows[x].saves, "salary": rows[x].salary, 
"cteam": rows[x].team_name, "position": rows[x].position_name, "nationality": rows[x].country_name});
    }
       context.queryList = array;
         res.render('filterPlayer', context);
});
});

/*********************************************************************************
 * Displaying only updateplayer page
 * 
 *********************************************************************************/
function displayData(req, res, next){
  var id = req.params.id;
  var sql = "SELECT * FROM `player` LEFT JOIN position ON player_position = position.position_id LEFT JOIN current_team ON player_team = current_team.team_id LEFT JOIN nationality ON player_nat = nationality.nationality_id WHERE player.player_id = (?);";
    sql = mysql.format(sql, id);
    connect.pool.query(sql, function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var array = [];
  for(var x in rows)
    {
    array.push({"id": rows[x].player_id, "fname" : rows[x].first_name, "lname" : rows[x].last_name, "goals": rows[x].goals, "assists": rows[x].assists, "saves": rows[x].saves, "salary": rows[x].salary, 
"teamName": rows[x].team_name, "posName": rows[x].position_name, "natName": rows[x].country_name, "posID": rows[x].player_position, "teamID": rows[x].player_team, "natID": rows[x].player_nat});
    }
    req.textList = array[0];
    return next();
  });
}

function displayPos(req, res, next){
  connect.pool.query("SELECT * FROM position;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].position_id, "name": rows[x].position_name});
    }
    req.queryList = array;
	return next();
});
}

function displayTeam(req, res, next){
  connect.pool.query("SELECT * FROM current_team;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].team_id, "team": rows[x].team_name});
    }
    req.teamList = array;
    return next();
});
}

function displayNat(req, res, next){
  connect.pool.query("SELECT * FROM nationality;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].nationality_id, "nat": rows[x].country_name});
    }
    req.natList = array;
    return next();
});
}

function renderUpdate(req, res){
  var context = {};
  context.textList = req.textList;
  context.queryList = req.queryList;
  context.teamList = req.teamList;
  context.natList = req.natList;
  res.render('updatePlayer', context);
}

app.get('/updatePlayer/:id', displayData, displayPos, displayTeam, displayNat, renderUpdate);

/*****************************************************************************************
 * End of displaying updatePlayer
 * **************************************************************************************/

app.post('/playerUpdated/:id', function(req, res, next){
    var id = req.params.id;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var goals = req.body.goals;
    var assists = req.body.assists;
    var saves = req.body.saves;
    var salary = req.body.salary;
    var position = req.body.position;
    var team = req.body.cteam;
    var nat = req.body.nat;
    var sql = 'UPDATE player SET first_name = (?), last_name = (?), goals = (?), assists = (?), saves = (?), salary = (?), player_position = (?), player_team = (?), player_nat = (?) WHERE player_id = (?);';
    var values = [fname, lname, goals, assists, saves, salary, position, team, nat, id];
    sql = mysql.format(sql, values);
    connect.pool.query(sql,function(){
    });
    res.redirect('/players');
});
/******************************************************************
 * Add nationality
 * ***************************************************************/
app.post('/addNat', function(req, res){
  var nat = req.body.country;
  var sql = "INSERT INTO `nationality` (country_name) VALUES (?);";
  var values = [nat];
  sql = mysql.format(sql, values);
  connect.pool.query(sql,function(){
  });
  res.redirect('/');
});

/*******************************************************************
 * Add position
 * ****************************************************************/
 
app.post('/addPos', function(req, res){
  var position = req.body.position;
  var sql = "INSERT INTO `position` (position_name) VALUES (?);";
  var values = [position];
  sql = mysql.format(sql, values);
  connect.pool.query(sql,function(){
  });
  res.redirect('/');
});

/**************************************************************************
 * TEAMS section with get, post, deletes, filter, and update.
 * ************************************************************************/
 function teamPageDisplay(req, res, next){
   connect.pool.query("SELECT * FROM current_team;", function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  var array = [];
	for (var x in rows)
	{
		array.push({"id":rows[x].team_id, "team": rows[x].team_name, "division": rows[x].division});
	}
  req.queryList = array;
  return next();
});
}

function teamPageDivision(req, res, next){
  connect.pool.query("SELECT DISTINCT division FROM current_team;", function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  var array = [];
	for (var x in rows)
	{
		array.push({"division": rows[x].division});
	}
  req.divisionList = array;
  return next();
});
}

function renderTeam(req, res){
  var context = {};
  context.queryList = req.queryList;
  context.divisionList = req.divisionList;
  res.render('teams', context);
}

app.get('/teams', teamPageDisplay, teamPageDivision, renderTeam);

app.post('/addTeam', function(req, res){
  var name = req.body.name;
  var division = req.body.division;
  var sql = "INSERT INTO `current_team` (team_name, division) VALUES (?,?);";
  var values = [name, division];
  sql = mysql.format(sql, values);
  connect.pool.query(sql,function(){
  });
  res.redirect('/teams');
});

app.delete('/teams/:id', function(req, res){
  var id = req.params.id;
  var sql = "DELETE FROM current_team WHERE team_id = (?);";
  sql = mysql.format(sql, id);
  connect.pool.query(sql,function(){
    
  });
  res.redirect('/teams');
});

app.get('/filterTeam', function(req, res, next){
  var division = req.query.division;
  var context = {};
  context.templateDivision = division;
  var sql = "SELECT * FROM `current_team` WHERE division = (?);";
  var values = [division];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(err, rows, fields){
  if(err){
      next(err);
      return;
    }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].team_id, "team": rows[x].team_name, "division": rows[x].division});
    }
       context.queryList = array;
      res.render('filterTeam', context);
});
});

function viewRosterTeamName(req, res, next){
  var id = req.params.id;
  var sql = "SELECT * FROM `current_team` WHERE team_id = (?);";
  var values = [id];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  req.templateTeam = rows[0].team_name;
	return next();
  });
}
function viewRosterDisplay(req, res, next){
  var id = req.params.id;
  var sql = "SELECT * FROM `player` LEFT JOIN position ON player.player_position = position.position_id INNER JOIN current_team ON player.player_team = current_team.team_id WHERE team_id = (?);";
  var values = [id];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  var array = [];
  for(var x in rows)
    {
      array.push({"fname": rows[x].first_name, "lname": rows[x].last_name, "position": rows[x].position_name, "team": rows[x].team_name});
    }
  req.queryList = array;
	return next();
  });
}

function rosterGoals(req, res, next){
  var id = req.params.id;
  var sql = "SELECT SUM(goals) AS goals FROM `player` INNER JOIN current_team ON player.player_team = current_team.team_id WHERE team_id = (?);";
  var values = [id];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  req.goals = rows[0].goals;
	return next();
  });
}

function rosterSalary(req, res, next){
  var id = req.params.id;
  var sql = "SELECT SUM(salary) AS salary FROM `player` INNER JOIN current_team ON player.player_team = current_team.team_id WHERE team_id = (?);";
  var values = [id];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  req.salary = rows[0].salary;
	return next();
  });
}

function renderRoster (req, res){
  var context = {};
  context.templateTeam = req.templateTeam;
  context.queryList = req.queryList;
  context.goals = req.goals;
  context.salary = req.salary;
  res.render('viewRoster', context);
}
app.get('/viewRoster/:id', viewRosterTeamName, viewRosterDisplay, rosterGoals, rosterSalary, renderRoster);

app.get('/updateCurrentTeam/:id', function(req, res, next){
  var context = {};
  var id = req.params.id;
  var sql = "SELECT * FROM `current_team` WHERE team_id = (?);";
  var values = [id];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  var array = [];
  for (var x in rows)
  {
    array.push({"id": rows[x].team_id, "team": rows[x].team_name, "division": rows[x].division});
  }
  context.textList = array[0];
  res.render('updateCurrentTeam', context);
  });
});

app.post('/teamUpdated/:id', function(req, res, next){
  var id = req.params.id;
  var teamName = req.body.teamName;
  var division = req.body.division;
  var sql = "UPDATE current_team SET team_name = (?), division = (?) WHERE team_id = (?);";
  var values = [teamName, division, id];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(){
  });
  res.redirect('/teams');
});

/********************************************************************************
 * Allstar section with get, post, and delete
 * ******************************************************************************/
 
 function allstarPlayer (req, res, next){
  connect.pool.query("SELECT * FROM player;", function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].player_id, "fname": rows[x].first_name, "lname": rows[x].last_name});
    }
  req.playerList = array;
	return next();
});
}

function allstarDisplay (req, res, next){
  connect.pool.query("SELECT * FROM allstar;", function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  var array = [];
  for(var x in rows)
    {
      array.push({"id": rows[x].allstar_id, "season": rows[x].season_year, "city": rows[x].city_host});
    }
  req.starList = array;
	return next();
});
}

function allstarjoinDisplay (req, res, next){
  connect.pool.query("SELECT allstar_join.join_id, player.first_name, player.last_name, player.goals, player.assists, player.saves, allstar.city_host, allstar.season_year, position.position_name FROM allstar_join INNER JOIN player ON allstar_join.player_id = player.player_id INNER JOIN allstar ON allstar_join.allstar_id = allstar.allstar_id LEFT JOIN position ON player.player_position= position.position_id;", function(err, rows, fields){
      if(err)
      {
      next(err);
      return;
      }
  var array = [];
  for (var x in rows)
  {
    array.push({"id": rows[x].join_id, "fname": rows[x].first_name, "lname": rows[x].last_name, "goals": rows[x].goals, "assists": rows[x].assists, "saves": rows[x].saves, "position": rows[x].position_name, "season": rows[x].season_year, "city": rows[x].city_host});
  }
  req.queryList = array;
	return next();
});
}

function renderAllstar (req, res){
  var context = {};
  context.playerList = req.playerList;
  context.starList = req.starList;
  context.queryList = req.queryList;
  res.render('allstar', context);
}

app.get('/allstar', allstarPlayer, allstarDisplay, allstarjoinDisplay, renderAllstar);

app.post('/addAllstar', function(req, res){
  var season = req.body.season;
  var city = req.body.city;
  var sql = "INSERT INTO `allstar` (season_year, city_host) VALUES (?,?);";
  var values = [season, city];
  sql = mysql.format(sql, values);
  connect.pool.query(sql,function(){
  });
  res.redirect('/allstar');
});

app.post('/postAllstar', function(req, res){
  var player = req.body.Player;
  var team = req.body.Allstar;
  var sql = "INSERT INTO `allstar_join` (player_id, allstar_id) VALUES (?, ?);";
  var values = [player, team];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(){
    
  });
  res.redirect('/allstar');
});

app.delete('/allstar/:id', function(req, res){
  var id = req.params.id;
  var sql = "DELETE FROM allstar_join WHERE join_id = (?);";
  sql = mysql.format(sql, id);
  connect.pool.query(sql,function(){
    
  });
  res.redirect('/allstar');
});

/*************************************************************************************
 * HISTORICAL TEAM section with get, post, and delete
 * **********************************************************************************/

function historicalPlayer(req, res, next){
    connect.pool.query("SELECT * FROM `player`;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var array = [];
    for (var x in rows)
    {
    array.push({"id": rows[x].player_id, "fname": rows[x].first_name, "lname": rows[x].last_name});
    }
    req.playerList = array;
    return next();
  });
}

function historyDisplay (req, res, next){
  connect.pool.query("SELECT * FROM `team_history`;", function(err, rows, fields){
  if(err){
      next(err);
      return;
    }
    var array = [];
    for (var x in rows)
    {
    array.push({"id": rows[x].team_id, "season": rows[x].season_year, "team": rows[x].team_name});
    }
    req.teamList = array;
    return next();
  });
}

function historyjoinDisplay (req, res, next){
  connect.pool.query("SELECT team_history_join.id, player.first_name, player.last_name, team_history.season_year, team_history.team_name FROM `team_history_join` INNER JOIN player on team_history_join.player_id = player.player_id INNER JOIN team_history ON team_history_join.team_id = team_history.team_id;",
  function(err,rows, fields){
       if(err){
      next(err);
      return;
    }
    var array = [];
    for (var x in rows)
    {
    array.push({"id": rows[x].id, "first": rows[x].first_name, "last": rows[x].last_name, "season": rows[x].season_year, "team": rows[x].team_name});
    }
    req.queryList = array;
    return next();
  });
}

function renderHistory(req, res){
  var context = {};
  context.playerList = req.playerList;
  context.teamList = req.teamList;
  context.queryList = req.queryList;
  res.render('history', context);
}

app.get('/historical', historicalPlayer, historyDisplay, historyjoinDisplay, renderHistory);

app.post('/addHistory', function(req, res){
  var season = req.body.season;
  var team = req.body.team;
  var sql = "INSERT INTO `team_history` (season_year, team_name) VALUES (?,?);";
  var values = [season, team];
  sql = mysql.format(sql, values);
  connect.pool.query(sql,function(){
  });
  res.redirect('/historical');
});

app.post('/postHistory', function(req, res){
  var player = req.body.playerAdd;
  var team = req.body.teamAdd;
  var sql = "INSERT INTO `team_history_join` (player_id, team_id) VALUES (?, ?);";
  var values = [player, team];
  sql = mysql.format(sql, values);
  connect.pool.query(sql, function(){
    
  });
  res.redirect('/historical');
});

app.delete('/history/:id', function(req, res){
  var id = req.params.id;
  var sql = "DELETE FROM team_history_join WHERE id = (?);";
  sql = mysql.format(sql, id);
  connect.pool.query(sql,function(){
    
  });
  res.redirect('/historical');
});

function goalLeaders(req, res, next){
    connect.pool.query("SELECT first_name, last_name, goals, current_team.team_name, position.position_name FROM `player` LEFT JOIN position ON player.player_position = position.position_id LEFT JOIN current_team ON player.player_team = current_team.team_id ORDER BY goals DESC LIMIT 3;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var array = [];
    for (var x in rows)
    {
    array.push({"fname": rows[x].first_name, "lname": rows[x].last_name, "goals": rows[x].goals, "team": rows[x].team_name, "pos": rows[x].position_name});
    }
    req.goalList = array;
    return next();
  });
}

function assistLeaders(req, res, next){
    connect.pool.query("SELECT first_name, last_name, assists, current_team.team_name, position.position_name FROM `player` LEFT JOIN position ON player.player_position = position.position_id LEFT JOIN current_team ON player.player_team = current_team.team_id ORDER BY assists DESC LIMIT 3;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var array = [];
    for (var x in rows)
    {
    array.push({"fname": rows[x].first_name, "lname": rows[x].last_name, "assists": rows[x].assists, "team": rows[x].team_name, "pos": rows[x].position_name});
    }
    req.assistsList = array;
    return next();
  });
}

function saveLeaders(req, res, next){
    connect.pool.query("SELECT first_name, last_name, saves, current_team.team_name, position.position_name FROM `player` LEFT JOIN position ON player.player_position = position.position_id LEFT JOIN current_team ON player.player_team = current_team.team_id ORDER BY saves DESC LIMIT 3;", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    var array = [];
    for (var x in rows)
    {
    array.push({"fname": rows[x].first_name, "lname": rows[x].last_name, "saves": rows[x].saves, "team": rows[x].team_name, "pos": rows[x].position_name});
    }
    req.savesList = array;
    return next();
  });
}

function renderLeaders(req, res){
  var context = {};
  context.goalList = req.goalList;
  context.assistsList = req.assistsList;
  context.savesList = req.savesList;
  res.render('leaders', context);
}

app.get('/leaders', goalLeaders, assistLeaders, saveLeaders, renderLeaders);


app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is listening!!!");
});

