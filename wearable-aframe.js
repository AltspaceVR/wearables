'use strict';

// n-skeleton-parent only works with root meshes at the moment. Since most model loaders use a root
// container object, we need to collapse the model so that n-skeleton-parent can access the mesh directly.
AFRAME.registerComponent('collapse-model', {
	init: function () {
		this.el.addEventListener('model-loaded', function () {
			this.el.setObject3D('mesh', this.el.object3DMap.mesh.children[0]);
			// setObject3D emits this event in a-frame 0.4.0
			this.el.emit('object3dset', {type: 'mesh'});
		}.bind(this));
	}
});

AFRAME.registerComponent('wearable-menu', {
	dependencies: ['sync-system'],
	init: function()
	{
		var url = window.location.href.replace(/\/(index.html)?\?/, '/menu.html?');
		var iconUrl = window.location.href.replace(/\/[^\/]*$/, '/icon-circle-bowtie.png');
		altspace.open(url, '_experience', {hidden: true, icon: iconUrl});
	}
});

AFRAME.registerComponent('wearable', {
	dependencies: ['sync', 'fit-to-avatar'],
	schema: {
		group: {type: 'string'}
	},
	init: function()
	{
		var syncSys = this.el.components.sync.syncSys;
		var userRef = syncSys.connection.app.child('users').child(this.el.dataset.creatorUserId);
		this.groupRef = userRef.child('wearable').child(this.data.group);
		this.avatarRef = userRef.child('avatarId');

		var self = this;
		this.groupRef.on('value', function(snapshot)
		{
			var value = snapshot.val();
			if(value === null){
				self.el.object3DMap.mesh.visible = false;
			}
			else {
				value = value.split('/');
				var model = value[0], texture = value[1];

				self.el.setAttribute('obj-model', 'obj', '.model.'+model);
				self.el.setAttribute('material', 'src', '.texture.'+texture);
				if(self.el.object3DMap.mesh)
					self.el.object3DMap.mesh.visible = true;

				self.adjust();
			}
		});

		this.avatarRef.on('value', function(snapshot)
		{
			var avatarId = snapshot.val();

			if(positions[self.data.group] && positions[self.data.group][avatarId])
				self.el.setAttribute('position', positions[self.data.group][avatarId].join(' '));
			else
				self.el.setAttribute('position', '0 0 0');

			if(self.data.group === 'neck')
			{
				if(/^robothead/.test(avatarId))
					self.el.setAttribute('n-skeleton-parent', 'part', 'head');
				else
					self.el.setAttribute('n-skeleton-parent', 'part', 'neck');
			}
		});
	},

	adjust: function()
	{
		var self = this;
		var userId = this.el.sceneEl.systems['sync-system'].userInfo.userId;
		if(this.el.dataset.creatorUserId === userId)
			this.el.components.sync.takeOwnership();
		else
			return;

		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.responseType = 'json';
		xhr.open('GET', 'https://account.altvr.com/api/v1/users/'+userId);

		if(self.lastRequestETag)
			xhr.setRequestHeader('If-Not-Modified', self.lastRequestETag);

		xhr.addEventListener('readystatechange', function(data)
		{
			if(xhr.readyState !== XMLHttpRequest.DONE) return;
			if(xhr.status !== 200 && xhr.status !== 304){
				console.warn('Could not fetch avatar info');
				return;
			}
			//self.lastRequestETag = xhr.getResponseHeader('ETag');

			var data = xhr.response;
			var avatarId = data.users[0].user_avatar.config.avatar.avatar_sid;
			var customId = data.users[0].avatar_customization_id;

			// lisa's custom avatar
			if(customId === "705088468077773509")
				self.avatarRef.set('rubenoid-female-01');

			// bill nye's custom avatar
			else if(customId === "719656889377358624")
				self.avatarRef.set('rubenoid-male-01');

			// everyone else
			else
				self.avatarRef.set(avatarId);
		});
		xhr.send();
	}
});

var positions = {
	neck: {
		'rubenoid-male-01': [0, -0.03, -0.07],
		'rubenoid-female-01': [0, -0.05, -0.04],
		'robothead-roundguy-01': [0, -0.07, -0.16],
		'robothead-propellerhead-01': [0, -0.2, 0],
		'a-series-m01': [0, -0.04, -0.07],
		'pod-classic': [0, 0, -0.09],
		's-series-f01': [0, 0, -0.09],
		's-series-m01': [0, -0.03, -0.15],
		'x-series-m02': [0, -0.04, -0.07]
	}
};
