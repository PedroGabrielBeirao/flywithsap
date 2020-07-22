sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/core/UIComponent"
], function (Controller, formatter, coreLibrary, Fragment, UIComponent) {
	"use strict";

	/* @Global
	 * Just For Simplification */
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("pt.procensus.FlyWithSapApp.controller.FlightSearch", {

		formatter: formatter,

		onInit: function () {
			// Get  Model and set it to view
			var oModel = this.getOwnerComponent().getModel();
			var oView = this.getView();
			oView.setModel(oModel);

			//initialize the table, items ="null" at start 
			var oTable = this.getView().byId("flightsTable");
			this.oBindingTable = oTable.getBindingInfo("items");
		},

		onSearch: function () {
			//the test subject used for coding
			//var data = this.getView().getModel().oData["VooSet(CompanhiaAerea='AA',NumeroConexao='0017',DataVoo=datetime'2020-01-16T00%3A00%3A00')"];

			//VARIABLES 
			var oView = this.getView();
			var oOrigin = oView.byId("originInput").getValue();
			var oDestiny = oView.byId("destinationInput").getValue();
			var oDate = oView.byId("dateInput").getValue();
			var oTable = this.getView().byId("flightsTable");
			var sClasse = oView.byId("typeInput").getSelectedItem().getText();
			var oColumnListItem = this.getView().byId("colunas");
			var aFiltersForItems = [];
			var aPaths = this._getFlightClass(sClasse);

			//refresh the table
			oTable.getModel().refresh(true);

			//push inputs to the array to serve as filter.
			aFiltersForItems.push(new sap.ui.model.Filter("CidadeOrigem", sap.ui.model.FilterOperator.EQ, oOrigin));
			aFiltersForItems.push(new sap.ui.model.Filter("CidadeDestino", sap.ui.model.FilterOperator.EQ, oDestiny));
			aFiltersForItems.push(new sap.ui.model.Filter("DataVoo", sap.ui.model.FilterOperator.EQ, oDate));

			// insert the cell dinamically without predefined binding path's
			oColumnListItem.insertCell(new sap.m.ObjectNumber({
				number: {
					parts: [{
						path: aPaths[0]
					}, {
						path: aPaths[1]
					}],
					formatter: function (iTotalLugares, iLugaresOcupados) {
						return (iTotalLugares - iLugaresOcupados);
					}
				},
				state: {
					parts: [{
						path: aPaths[0]
					}, {
						path: aPaths[1]
					}],
					formatter: function (iTotalLugares, iLugaresOcupados) {
						var iAvailableSeats = (iTotalLugares - iLugaresOcupados);
						if (iAvailableSeats >= 20)
							return ValueState.Success;
						else if (iAvailableSeats < 20 && iAvailableSeats > 10)
							return ValueState.Warning;
						return ValueState.Error;
					}
				}
			}), 5); // cell index 

			//  Binding is done only when the button is pressed, at initialization items="" at table
			oTable.bindItems({
				path: "/VooSet",
				template: this.oBindingTable.template,
				templateShareable: true,
				filters: aFiltersForItems
			});
			this._toggleVisibility();
		},
		

		/* logic to get the paths 
		 *corresponding to the oData, based on the user 
		 *selection for the class of flight
		 */
		_getFlightClass: function (sInputClass) {
			var aAux = [];
			if (sInputClass === "Business Class") {
				aAux[0] = "TotalLugaresBus";
				aAux[1] = "LugaresOcupadosBus";
				return aAux;
			} else if (sInputClass === "Economy Class") {
				aAux[0] = "TotalLugaresEcon";
				aAux[1] = "LugaresOcupadosEcon";
				return aAux;
			} else if (sInputClass === "First Class") {
				aAux[0] = "TotalLugares1aClass";
				aAux[1] = "LugaresOcupados1aClass";
				return aAux;
			}
			return aAux;
		},

		/* change the visibility of the 
		 *search panel and the table */
		_toggleVisibility: function () {
			this._oTablePanel = this.byId("LazyLoadingTable");
			this._oTablePanel.setVisible(true);
			this._oSearchPanel = this.byId("searchPanel");
			this._oSearchPanel.setVisible(false);
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
		
		onConfirmationRefresh : function() {
			this._oTablePanel = this.byId("LazyLoadingTable");
			this._oTablePanel.setVisible(false);
			this._oSearchPanel = this.byId("searchPanel");
			this._oSearchPanel.setVisible(true);
			this._resetInputs();
			this._getDialog().close();
			
		},
		
		_resetInputs : function(){
			this._oView = this.getView();
			this._oView.byId("originInput").setValue("");
			this._oView.byId("destinationInput").setValue("");
			this._oView.byId("dateInput").setValue("");
			this._oView.byId("typeInput").setSelectedKey("C");    
		},
		
		onSelect: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("details");
		}
			
	});
});