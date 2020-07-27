sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function(Controller, History, UIComponent) {
	"use strict";

	return Controller.extend("pt.procensus.FlyWithSapApp.controller.BaseController", {

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home", {}, true /*no history*/);
			}
		},
		
		/*SEARCH AGAIN DIALOG EVENT HANDLERS */
		_getDialog : function() {
			//if the fragment doesnt exist yet it is instantiated, dependent to be connected to the view lifecycle
			if(!this._oDialog) {
				//the this parameter in xmlfragment references the controller to the xmlfragment it could be other
				this._oDialog = sap.ui.xmlfragment( "pt.procensus.FlyWithSapApp.view.dialogs.SearchAgainDialog",this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		onOpenDialog : function() {
			this._getDialog().open();
		},
		onCloseDialog : function() {
			this._getDialog().close();
		},
		
		onSelect : function(oEvent) {
			// also possible: 
			// var oRouter = this.getOwnerComponent().getRouterFor(this);
		
			 var oRouter = sap.ui.core.UIComponent.getRouterFor(this); 
			 
			 var oItem = oEvent.getSource();
			 var oContext = oItem.getBindingContext();
			 
			 var CompanhiaAerea = oItem.getBindingContext().getProperty("CompanhiaAerea"); //AA
			 var NumeroConexao = oItem.getBindingContext().getProperty("NumeroConexao"); // 0017
			 
			 //auiliar para ir buscar a dataVoo
			 var aPath = oContext.sPath.split(",");
			 var aDatePath = aPath[2].split("=");
			 var sDataVoo = aDatePath[1].slice(0, -1);
			 
			 oRouter.navTo("details", {
				CompanhiaAerea: CompanhiaAerea,
				NumeroConexao: NumeroConexao,
				DataVoo : sDataVoo
			 });
		}

	});

});