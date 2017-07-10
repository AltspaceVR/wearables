# Wearables system for AltspaceVR

This app provides a main app that outfits users with fashion accessories, and a menu app that allows users to choose their accessories. It is designed for maximum reuse, so the addition of new items, or even whole new categories, should be relatively simple. To add a new item, you will need three things: an OBJ model of the accessory in meter scale, a PNG or JPG texture to go with the model, and a thumbnail image of the resulting accessory (optional). Models or textures can and should be reused between accessories.


## Adding items to an existing group

1. Add a list item `<li>` to the desired group's list in `menu.html`. Groups are defined by an `<ol>` element with a `data-wearable-group` attribute.
2. Add a `data-wearable` attribute to your new item with the names of the model and texture needed for your item, separated by a slash character. So if you wanted to use the "sword" model and the "valyrian" texture, you might add `data-wearable=sword-2h/valyrian`.
3. Add a label/description inside your list item. Typically this would be a thumbnail image, but text can be used as a placeholder.
4. In `index.html`, add the references to your new model and/or texture to `<a-assets>`. Assign them the class corresponding to their type (`model` or `texture`), and another class corresponding to the asset's name used in step 2. Example: `<a-asset-item class='model sword-2h' src='models/sword.obj'></a-asset-item>` or `<img class='texture valyrian' src='textures/valyrian.png'/>`

That's it! Clicking on the new item in the menu should bring up your new model/texture combo on your avatar.


## Adding a new group

1. Add a new unordered list to `menu.html`. Give it the class `wearable-selector` and a `data-wearable-group` attribute with the value being the group name.
2. Add new items to the group as described above.
3. In `index.html`, create a new mixin for items in this new group. You should copy/paste the "tie" mixin, and edit it to your needs. You'll probably want to change the `n-skeleton-parent` component to attach to a different body part, and the `wearable` component to use the new group.
4. Add a new entity to the bottom of the scene with a `one-per-user` component, whose `mixin` argument references the mixin you created above.
5. (Optional) Add per-avatar position customizations to the object at the bottom of `wearable-aframe.js`, in a new object named for your new group.
