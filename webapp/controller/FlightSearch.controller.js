sap.ui.define([
	"pt/procensus/FlyWithSapApp/controller/BaseController",
	"../model/formatter",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/core/UIComponent"
], function (BaseController, formatter, MessageToast, Fragment, UIComponent) {
	"use strict";

	return BaseController.extend("pt.procensus.FlyWithSapApp.controller.FlightSearch", {

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

			//VARIABLES
			var oView = this.getView();
			var oOrigin = oView.byId("originInput").getValue();
			var oDestination = oView.byId("destinationInput").getValue();
			var oDate = oView.byId("dateInput").getValue();
			var oTable = this.getView().byId("flightsTable");
			var sClasse = oView.byId("typeInput").getSelectedItem().getText();
			var oColumnListItem = this.getView().byId("colunas");
			var aFiltersForItems = [];
			var aPaths = this._getFlightClass(sClasse); // returns the paths of the corresponding flight class
			
			if (this._isInputEmpty(oOrigin, oDestination, oDate)) {
				var resourceBundle = this.getView().getModel("i18n").getResourceBundle();	
				MessageToast.show(resourceBundle.getText("inputIsEmpty"));
			}else{
				
				//saving the classe input key to a auxiliary model for further use
				var sClasseKey = oView.byId("typeInput").getSelectedItem().getKey();
				this.getOwnerComponent().getModel("reservaVooModel").setProperty("/ClasseVoo", sClasseKey);
				this.getOwnerComponent().getModel("searchInputs").refresh(true);
				oTable.getModel().refresh(true);
			
				//push inputs to the array to serve as filter.
				/*		aFiltersForItems.push(new sap.ui.model.Filter("CidadeOrigem", sap.ui.model.FilterOperator.EQ, oOrigin));
						aFiltersForItems.push(new sap.ui.model.Filter("CidadeDestino", sap.ui.model.FilterOperator.EQ, oDestiny));
						aFiltersForItems.push(new sap.ui.model.Filter("DataVoo", sap.ui.model.FilterOperator.EQ, oDate)); */
					
				// insert the cell dinamically without predefined binding path's to change the displayed seats value by class
				this._insertCell(oColumnListItem, aPaths[0], aPaths[1], 5);
				this._bindToTable(oTable, aFiltersForItems);
				this._toggleVisibility();
				this._saveUserInputData(sClasse);
				}
		},
		
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
		
		_isInputEmpty: function (sInput1 ,sInput2, sInput3){
			if(sInput1 === "" || sInput2 === "" || sInput3 === "") {
				return true;
			}else{
				return false;
			}
		},
		
		_insertCell: function (oColumn, sPath1, sPath2, index) {
			
					oColumn.insertCell(new sap.m.ObjectNumber({
				number: {
					parts: [{
						path: sPath1
					}, {
						path: sPath2
					}],
					formatter: this.formatter.calcSeats
				},
				state: {
					parts: [{
						path: sPath1
					}, {
						path: sPath2
					}],
					formatter: this.formatter.availableSeatsStatus
				}
			}), index);// cell index
		},
		
		_bindToTable: function( oTable, aFilterByInputs){
				oTable.bindItems({
				path: "/VooSet",
				template: this.oBindingTable.template,
				templateShareable: true,
				filters: aFilterByInputs
			});
		},
		
		_toggleVisibility: function () {
			this._oTablePanel = this.byId("LazyLoadingTable");
			this._oTablePanel.setVisible(true);
			this._oSearchPanel = this.byId("searchPanel");
			this._oSearchPanel.setVisible(false);
		},
		
		_saveUserInputData: function (sClasse) {
			// save some data to the searchInputs model before navigation
			var auxiliarModel = this.getOwnerComponent().getModel("searchInputs");
			auxiliarModel.setProperty("/ClasseVoo", sClasse);
		},

		onConfirmationRefresh: function () {
			this._oTablePanel = this.byId("LazyLoadingTable");
			this._oTablePanel.setVisible(false);
			this._oSearchPanel = this.byId("searchPanel");
			this._oSearchPanel.setVisible(true);
			this._resetInputs();
			this._getDialog().close();
		},

		_resetInputs: function () {
			this._oView = this.getView();
			this._oView.byId("originInput").setValue("");
			this._oView.byId("destinationInput").setValue("");
			this._oView.byId("dateInput").setValue("");
			this._oView.byId("typeInput").setSelectedKey("C");
		},
		
		onSwitch: function () {
			/*Switch user input origin||destination*/
			
			this._oView = this.getView();
			var oOrigin = this._oView.byId("originInput").getValue();
			var oDestination = this._oView.byId("destinationInput").getValue();
			this._oView.byId("originInput").setValue(oDestination);
			this._oView.byId("destinationInput").setValue(oOrigin);
		},

		onSelect: function (oEvent) {
			/*When the user presses the desired flight */
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext();

			var CompanhiaAerea = oItem.getBindingContext().getProperty("CompanhiaAerea"); //AA
			var NumeroConexao = oItem.getBindingContext().getProperty("NumeroConexao"); // 0017

			//CALCULO TEMPORARIO DOS TOTAIS de lugares vazios
			var sTotalLugaresEcon = oItem.getBindingContext().getProperty("TotalLugaresEcon");
			var sLugaresOcupadosEcon = oItem.getBindingContext().getProperty("LugaresOcupadosEcon");
			var sLugaresVaziosEcon = sTotalLugaresEcon - sLugaresOcupadosEcon;

			var sTotalLugares1aClass = oItem.getBindingContext().getProperty("TotalLugares1aClass");
			var sLugaresOcupados1aClass = oItem.getBindingContext().getProperty("LugaresOcupados1aClass");
			var sLugaresVazios1aClass = sTotalLugares1aClass - sLugaresOcupados1aClass;

			var sTotalLugaresBus = oItem.getBindingContext().getProperty("TotalLugaresBus");
			var sLugaresOcupadosBus = oItem.getBindingContext().getProperty("LugaresOcupadosBus");
			var sLugaresVaziosBus = sTotalLugaresBus - sLugaresOcupadosBus;

			//set the values to the temporary model
			var auxiliarModel = this.getOwnerComponent().getModel("searchInputs");
			auxiliarModel.setProperty("/LugaresVaziosEcon", sLugaresVaziosEcon);
			auxiliarModel.setProperty("/LugaresVazios1aClass", sLugaresVazios1aClass);
			auxiliarModel.setProperty("/LugaresVaziosBus", sLugaresVaziosBus);

			//auiliar para ir buscar a dataVoo
			var aPath = oContext.sPath.split(",");
			var aDatePath = aPath[2].split("=");
			var sDataVoo = aDatePath[1].slice(0, -1);

			oRouter.navTo("details", {
				CompanhiaAerea: CompanhiaAerea,
				NumeroConexao: NumeroConexao,
				DataVoo: sDataVoo
			});

		}

	});
});