sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function (Controller, History, UIComponent) {
	"use strict";

	return Controller.extend("pt.procensus.FlyWithSapApp.controller.BaseController", {

		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home", {}, true /*no history*/ );
			}
		},

		/*SEARCH AGAIN DIALOG EVENT HANDLERS */
		_getDialog: function () {
			//if the fragment doesnt exist yet it is instantiated, dependent to be connected to the view lifecycle
			if (!this._oDialog) {
				//the this parameter in xmlfragment references the controller to the xmlfragment it could be other
				this._oDialog = sap.ui.xmlfragment("pt.procensus.FlyWithSapApp.view.dialogs.SearchAgainDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		onOpenDialog: function () {
			this._getDialog().open();
		},
		onCloseDialog: function () {
			this._getDialog().close();
		}

	});

});