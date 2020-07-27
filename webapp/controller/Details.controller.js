sap.ui.define([
	"pt/procensus/FlyWithSapApp/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("pt.procensus.FlyWithSapApp.controller.Details", {

		onInit: function () {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("details").attachPatternMatched(this._onDetailMatched, this); 
		},
		_onDetailMatched: function(oEvent) 
		{ 
			var sObjectPath = "/VooSet" + "(CompanhiaAerea=" + "'" + oEvent.getParameter("arguments").CompanhiaAerea + "'" + "," + 
			"NumeroConexao=" + "'" + oEvent.getParameter("arguments").NumeroConexao + "'" + "," + 
			"DataVoo=" + oEvent.getParameter("arguments").DataVoo + ")";
			var oView = this.getView(); 
			oView.bindElement(sObjectPath); } 
	});

});