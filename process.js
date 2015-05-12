var fs = require('fs');
var beautify = require('js-beautify').js_beautify;

var collectionsNames = [
	'posts', 
	'organizations', 
	'memberships', 
	'persons'
];

var deleteFields = {
	'posts': ['html_url', 'url', 'memberships'], 
	'organizations': ['html_url', 'url', 'memberships'], 
	'memberships': ['html_url', 'url'], 
	'persons': ['memberships', 'links', 'identifiers', 'other_names', 'html_url', 'url', 'images', 'proxy_image']
}

var collections = {};

collectionsNames.forEach(function(colName){
	collections[colName] = JSON.parse(fs.readFileSync(colName + '.json').toString());
	console.log('Processing', collections[colName].length,  colName);
	collections[colName] = cleanupCollection(collections[colName], deleteFields[colName]);
	// console.log(getNonEmptyKeys(collections[colName]));
});

var hashes = {};
hashes['persons'] = collections.persons.reduce(function(memo, item){ memo[item.id] = item; return memo;},{});
hashes['posts'] = collections.posts.reduce(function(memo, item){ memo[item.id] = item; return memo;},{});
hashes['organizations'] = collections.organizations.reduce(function(memo, item){ memo[item.id] = item; return memo;},{});

var outFields = [
	['persons', 'name'],
	['persons', 'birth_date'],
	['persons', 'sources'],
	['persons', 'summary'],
	['persons', 'image'],
	['persons', 'name'],

	['organizations', 'name'],
	['organizations', 'classification'],

	['posts', 'label'],
	['posts', 'role'],
	['posts', 'cargonominal'],
	['posts', 'cargotipo'],
	['posts', 'cargoclase'],
	['posts', 'duracioncargo'],

	['memberships', 'label'],
	['memberships', 'role'],
	['memberships', 'cargonominal'],
	['memberships', 'start_date'],
	['memberships', 'end_date'],
	['memberships', 'end_date_accuracy'],
	['memberships', 'start_date_accuracy'],
];

var rows = [];
rows.push([]);

outFields.forEach(function(field){
	rows[0].push( enquote( field.join('-') ) ) ;	
})

collections.memberships.forEach(function(membership){

	var row = [];
	var person = hashes['persons'][membership.person_id] || {}
	var post = hashes['posts'][membership.post_id] || {} 
	var organization = hashes['organizations'][membership.organization_id] || {}

	outFields.forEach(function(field){
		if(field[0]=='persons'){
			row.push( enquote ( person[field[1]]) )
		}else if(field[0]=='posts'){
			row.push( enquote ( post[field[1]]) )
		}else if(field[0]=='organizations'){
			row.push( enquote ( organization[field[1]]) )
		}else if(field[0]=='memberships'){
			row.push( enquote ( membership[field[1]]) )
		}else{
			throw "ERror not a valid item"
		}
	})

	rows.push(row);
});

fs.writeFileSync('out.csv', rows.join('\n'))
console.log('done');

function enquote(s){
	//Double quotes
	if(typeof s == 'undefined') s = ''
	if(typeof s != 'string'){
		if(s.toString) s = s.toString(); else s = '';	
	} 
	
	s = s.replace(/\"/g, '""');
	return '"' + s + '"';
}

//collections.persons = cleanupCollection(collections.persons, ['memberships', 'links', 'identifiers', 'other_names', 'html_url', 'url', 'images', 'proxy_image'])

// console.log(beautify(JSON.stringify(collections.posts)));


// console.log("Persons")


// .forEach(function(k){ console.log(k); });

function cleanupCollection(collection, deleteFields){
	
	collection.forEach(function(item){
		deleteFields.forEach(function(d){
			delete item[d];
		})
	})

	var nonEmptyKeys = getNonEmptyKeys(collection);

	var mappedCol = collection.map(function(p){
		var s = {}
		nonEmptyKeys.forEach(function(k){
			if(p && (   (typeof p[k] === 'string' && p[k] !='')  || ( ( Object.prototype.toString.call( p[k] ) === '[object Array]' && p[k].length > 0 ) ) )  ){ s[k] = p[k]}
		})
		return s;
	})
	
	return mappedCol;
}


function getNonEmptyKeys(col){
	var s, keys = {}, arrk = [];
	col.forEach(function(item){
		Object.keys(item).forEach(function(k){
			if(typeof item[k] === 'string' && item[k] != '' ){
				keys[k] = k;
			}else if( Object.prototype.toString.call( item[k] ) === '[object Array]' && item[k].length > 0 ){
				keys[k] = k;
			}
		})
	});
	for(s in keys){ arrk.push(s); }
	return arrk;
}
