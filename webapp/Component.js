sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"pt/procensus/FlyWithSapApp/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("pt.procensus.FlyWithSapApp.Component", {

		metadata: {
			manifest: "json"
		},
		
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			//load the images
			var imagesRoot = jQuery.sap.getModulePath("pt.procensus.FlyWithSapApp.images");
			var oImageModel = new sap.ui.model.json.JSONModel({
			path : imagesRoot
			});
			this.setModel(oImageModel, "imageModel");
			
			
		}
	});
});