var Toolkit = require('popit-toolkit');
var Q = require('q');
var fs = require('fs');
// Get toolkit instance and set config values:

var toolkit = Toolkit({
    host: 'cargografias.popit.mysociety.org', 
   // Apikey: 'yourInstanceApiKey'       // optional if not going to write to the api
});

Q.all([
toolkit.loadAllItems('persons'),
toolkit.loadAllItems('posts'),
toolkit.loadAllItems('memberships'),
toolkit.loadAllItems('organizations')
]).spread(function(persons, posts, memberships, organizations){

	fs.writeFileSync('persons.json', JSON.stringify(persons));
	fs.writeFileSync('posts.json', JSON.stringify(posts));
	fs.writeFileSync('memberships.json', JSON.stringify(memberships));
	fs.writeFileSync('organizations.json', JSON.stringify(organizations));
	
}).catch(function(err){
	console.log("error", err)
})


