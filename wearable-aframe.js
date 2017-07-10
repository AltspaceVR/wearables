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
		console.log(this.el.systems['sync-system'].clientId);
		var clientId = this.el.systems['sync-system'].clientId;
		url += '&clientId='+clientId;

		altspace.open(url, '_experience', {hidden: true});
	}
});

AFRAME.registerComponent('wearable', {
	dependencies: ['sync'],
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
			console.log(value);
			if(value === null){
				self.el.object3DMap.mesh.visible = false;
			}
			else {
				value = value.split('/');
				var model = value[0], texture = value[1];

				self.el.setAttribute('obj-model', 'obj', '.model.'+model);
				self.el.setAttribute('material', 'src', '.texture.'+texture);
				self.el.object3DMap.mesh.visible = true;
			}
		});
	}
});
