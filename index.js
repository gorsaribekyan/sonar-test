import fs from 'fs'
import fetch from 'node-fetch'
import { execSync } from 'child_process'

const fileName = "node index.js"

const client_id = 'rdyHrZZqu6tXgWx5PS'	
const secret = 'tGjMRKCJpkD4XuaGTpVYNPvJbs7pjwHd'

var data;
async function get_access_with_refresh(){
	var command = `
curl -X POST -u "${client_id}:${secret}" \
https://bitbucket.org/site/oauth2/access_token \
-d grant_type=refresh_token -d refresh_token=${JSON.parse(fs.readFileSync('token.json'))['refresh_token']} \
> token.json
	`
	try{
		const stdout = execSync(command);
		var rawdata = fs.readFileSync('token.json');
		data = JSON.parse(rawdata);
		console.log("[+] Token successfully taken.")		
	}catch(e){
		console.log(e)
		return
	}
}



//##########################################################################################################

function approve(workspace, repo_slug, pull_request_id){
	if(!workspace || !repo_slug || !pull_request_id){
		console.log("[-] Empty parameter.")
		return
	}
	fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/approve`, {
	  method: 'POST',
	  headers: {
	    'Authorization': `Bearer ${data.access_token}`,
	    'Accept': 'application/json'
	  }
	})
	  .then(response => {
	    console.log(
	      `Response: ${response.status} ${response.statusText}`
	    );
	    return response.text();
	  })
	  .then(text => console.log(text))
	  .catch(err => console.error(err));
}

//##########################################################################################################

function requestChanges(workspace, repo_slug, pull_request_id){
	if(!workspace || !repo_slug || !pull_request_id){
		console.log("[-] Empty parameter.")
		return
	}
	fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/request-changes`, {
	  method: 'POST',
	  headers: {
	    'Authorization': `Bearer ${data.access_token}`,
	    'Accept': 'application/json'
	  }
	})
	  .then(response => {
	    console.log(
	      `Response: ${response.status} ${response.statusText}`
	    );
	    return response.text();
	  })
	  .then(text => console.log(text))
	  .catch(err => console.error(err));
}

//##########################################################################################################

function comment(workspace, repo_slug, pull_request_id, text){
	if(!workspace || !repo_slug || !pull_request_id || !text){
		console.log("[-] Empty parameter.")
		return
	}
	const bodyData = `
	{
	  "content": {
	    "raw": "${text}"
	  }
	}`;

	fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/pullrequests/${pull_request_id}/comments`, {
	  method: 'POST',
	  headers: {
	    'Authorization': `Bearer ${data.access_token}`,
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
	  },
	  body: bodyData
	})
	  .then(response => {
	    console.log(
	      `Response: ${response.status} ${response.statusText}`
	    );
	    return response.text();
	  })
	  .then(text => console.log(text))
	  .catch(err => console.error(err));
}
//##########################################################################################################

function createBuildStatus(workspace, repo_slug, commit){
	if(!workspace || !repo_slug || !commit){
		console.log("[-] Empty parameter.")
		return
	}

const bodyData = `
{
	"key": "-1081267614",
    "state": "SUCCESSFUL",
    "description": "42 tests passed",
    "url": "https://api.bitbucket.org/2.0/repositories/d0tfl0w/test/commit/78e41402347d3e36f4cc9cfe54ad76433365b0c5/statuses/build/-1081267614"
}`
	
	fetch(`https://api.bitbucket.org/2.0/repositories/d0tfl0w/test/commit/78e41402347d3e36f4cc9cfe54ad76433365b0c5/statuses/build/-1081267614`, {
	  method: 'PUT',
	  headers: {
	    'Authorization': `Bearer ${data.access_token}`,
	    'Accept': 'application/json'
	  },
	  body: bodyData
	})
	  .then(response => {
	    console.log(
	      `Response: ${response.status} ${response.statusText}`
	    );
	    return response.text();
	  })
	  .then(text => console.log(text))
	  .catch(err => console.error(err));
}

//##########################################################################################################

var args = process.argv; args.splice(0, 2)

// console.log(args)

if(args[0] == "--action"){
	get_access_with_refresh()
	//**********************************************************************************************************
	
	if(args[1] == "approve"){
		if(args[2] == "--workspace" && args[4] == "--repo" && args[6] == "--id"){
			approve(args[3], args[5], args[7])
		} else {
			console.log(`[-] For approve a pull request try this.\n[$] ${fileName} --workspace {yourWorkspace} --repo {yourRepasitory} --id {pullRequestId}`)
		}
	}	
	
	//**********************************************************************************************************
	
	if(args[1] == "requestChanges"){
		if(args[2] == "--workspace" && args[4] == "--repo" && args[6] == "--id"){
			requestChanges(args[3], args[5], args[7])
		} else {
			console.log(`[-] For Request Changes a pull request try this.\n[$] ${fileName} --workspace {yourWorkspace} --repo {yourRepasitory} --id {pullRequestId}`)
		}
	}

	//**********************************************************************************************************

	if(args[1] == "comment"){
		if(args[2] == "--workspace" && args[4] == "--repo" && args[6] == "--id" && args[8] == "--text"){
			comment(args[3], args[5], args[7], args[9])
		}
	}	

	//**********************************************************************************************************

	if(args[1] == "createBuildStatus"){
		if(args[2] == "--workspace" && args[4] == "--repo" && args[6] == "--commit" ){
			createBuildStatus(args[3], args[5], args[7])
		} 
	}
	
	//**********************************************************************************************************
	
}


if(args[0] == "--help"){
	console.log(
`[+] Approve.
${fileName} --action approve --workspace {workspace} --repo {repasitory} --id {pull_request_id}

[+] Request Changes.
${fileName} --action requestChanges --workspace {workspace} --repo {repasitory} --id {pull_request_id}

[+] Comment.
${fileName} --action comment --workspace {workspace} --repo {repasitory} --id {pull_request_id} --text {"your_text_here"}


	`)
}











