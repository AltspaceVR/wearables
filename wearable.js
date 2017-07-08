'use strict';

if(window.AFRAME)
{

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

}
else {
	
}
