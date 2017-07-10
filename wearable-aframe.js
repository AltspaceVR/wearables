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

		altspace.open(url, '_experience', {hidden: true});
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

				var fta = self.el.components['fit-to-avatar'];
				setTimeout(fta.adjust.bind(fta), 1000);
			}
		});
	}
});

AFRAME.registerComponent('fit-to-avatar', {
	dependencies: ['sync'],
	adjust: function()
	{
		if(!this.el.components.sync.isMine){
			return;
		}

		var self = this;
		var userId = this.el.sceneEl.systems['sync-system'].userInfo.userId;

		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.responseType = 'json';
		xhr.open('GET', 'https://account.altvr.com/api/v1/users/'+userId);
		xhr.setRequestHeader('Access-Control-Request-Headers', 'ETag');
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

			self.el.setAttribute('position', neckPositions[avatarId].join(' '));
			if(/^robothead/.test(avatarId))
				self.el.setAttribute('n-skeleton-parent', 'part', 'head');
			else
				self.el.setAttribute('n-skeleton-parent', 'part', 'neck');
		});
		xhr.send();
	}
});

var neckPositions = {
	'rubenoid-male-01': [0, -0.03, -0.07],
	'rubenoid-female-01': [0, -0.05, -0.04],
	'robothead-roundguy-01': [0, -0.07, -0.16],
	'robothead-propellerhead-01': [0, -0.2, 0],
	'a-series-m01': [0, -0.04, -0.07],
	'pod-classic': [0, 0, -0.09],
	's-series-f01': [0, 0, -0.09],
	's-series-m01': [0, -0.03, -0.15],
	'x-series-m01': [0,0,0],
	'x-series-m02': [0, -0.04, -0.07]
};
