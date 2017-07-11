'use strict';

var connection, userData;

function userPoly(){
	return new Promise(function(resolve, reject){
		return resolve({userId: "521818417662001643", displayName: 'Steven', isModerator: true});
	})
}

function getNearestAncestor(el, selector){
	if(el == document) return null;
	else if(el.matches(selector)) return el;
	else return getNearestAncestor(el.parentElement, selector);
}

function select(evt)
{
	var parentList = getNearestAncestor(evt.target, 'ul.wearable-selector');
	var listItem = getNearestAncestor(evt.target, 'ul.wearable-selector > li');
	var group = parentList.dataset.wearableGroup;
	var groupRef = connection.userRef.child('wearable').child(group);
	var wearable = listItem.dataset.wearable;

	wearable ? groupRef.set(wearable) : groupRef.remove();

	parentList.querySelector('.selected').classList.remove('selected');
	listItem.classList.add('selected');
}

Promise.all([
	altspace.utilities.sync.connect({
		authorId: 'AltspaceVR',
		appId: 'Wearables',
		baseRefUrl: 'https://altspace-wearables.firebaseio.com/'
	}),
	(altspace.getUser || userPoly)()
])
.then(function(results)
{
	connection = results.shift();
	userData = results.shift();

	connection.userRef = connection.app.child('users').child(userData.userId);

	var groupsList = document.querySelectorAll('ul.wearable-selector');
	groupsList = Array.prototype.slice.call(groupsList);
	groupsList.forEach(function(groupEl)
	{
		var groupRef = connection.userRef.child('wearable').child(groupEl.dataset.wearableGroup);
		groupRef.once('value', function(snapshot)
		{
			var value = snapshot.val() || "";

			var selectablesList = groupEl.querySelectorAll('li');
			selectablesList = Array.prototype.slice.call(selectablesList);
			selectablesList.forEach(function(el){
				if(el.dataset.wearable == value)
					el.classList.add('selected');

				el.addEventListener('click', select);
			});
		});
	});
})
.catch(function(err){ console.log(err); });
