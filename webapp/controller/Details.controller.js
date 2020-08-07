sap.ui.define([
	"pt/procensus/FlyWithSapApp/controller/BaseController",
	"../model/formatter",
	"sap/ui/core/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, formatter, coreLibrary, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("pt.procensus.FlyWithSapApp.controller.Details", {

		formatter: formatter,
		onInit: function () {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("details").attachPatternMatched(this._onDetailMatched, this);
		},

		_onDetailMatched: function (oEvent) {
			var sObjectPath = "/VooSet" + "(CompanhiaAerea=" + "'" + oEvent.getParameter("arguments").CompanhiaAerea + "'" + "," +
				"NumeroConexao=" + "'" + oEvent.getParameter("arguments").NumeroConexao + "'" + "," +
				"DataVoo=" + oEvent.getParameter("arguments").DataVoo + ")";
			var oView = this.getView();
			oView.bindElement(sObjectPath);
			this._getUserInputData();
		},

		//retrieving user input data needed in details view
		_getUserInputData: function () {
			//calling the searchInput model
			var auxiliarModel = this.getOwnerComponent().getModel("searchInputs");
			var oView = this.getView();

			var sClasseVoo = auxiliarModel.getProperty("/ClasseVoo");
			oView.byId("PriceObjectHeader").setIntro(sClasseVoo);

			//try to use a global formatter later
			this._getFlightClassTemporary(sClasseVoo);

			//logic to disable the buttons when the there are no available seats
			var iAvailableSeats = this.getView().byId("SeatsObjectHeader").getNumber();
			this._bookButtonAble(iAvailableSeats);
		},

		_bookButtonAble: function (iAvailableSeats) {
	
			var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oBookButton = this.getView().byId("bookButton");
			if (iAvailableSeats > 0) {
				this.getView().byId("clienteSelect").setVisible(true);
				this.getView().byId("customerIcon").setVisible(true);
				oBookButton.setEnabled(true).setType("Emphasized").setText(resourceBundle.getText("ButtonReserve"));
			} else {
				this.getView().byId("clienteSelect").setVisible(false);
				this.getView().byId("customerIcon").setVisible(false);
				oBookButton.setEnabled(false).setType("Reject").setText(resourceBundle.getText("ButtonNotAvailable"));
			}
		},

		_getFlightClassTemporary: function (sInputClass) {
			var oView = this.getView();
			var auxiliaryModel = this.getOwnerComponent().getModel("searchInputs");

			if (sInputClass === "Business Class") {
				var availableSeatsBus = auxiliaryModel.getProperty("/LugaresVaziosBus");
				var sState = formatter.availableSeatsStatusDetail(availableSeatsBus);
				oView.byId("SeatsObjectHeader").setNumber(availableSeatsBus);
				oView.byId("SeatsObjectHeader").setNumberState(sState);

			} else if (sInputClass === "Economy Class") {
				var availableSeatsEco = auxiliaryModel.getProperty("/LugaresVaziosEcon");
				var sStateEco = formatter.availableSeatsStatusDetail(availableSeatsEco);
				oView.byId("SeatsObjectHeader").setNumber(availableSeatsEco);
				oView.byId("SeatsObjectHeader").setNumberState(sStateEco);

			} else if (sInputClass === "First Class") {
				var availableSeats1aClass = auxiliaryModel.getProperty("/LugaresVaziosBus");
				var sState1aClass = formatter.availableSeatsStatusDetail(availableSeats1aClass);
				oView.byId("SeatsObjectHeader").setNumber(availableSeats1aClass);
				oView.byId("SeatsObjectHeader").setNumberState(sState1aClass);
			}
		},

		//Navigation to the create user page
		onCreateUser: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("createUser");
		},

		/* BOOK OPERATIONS*/
		onBookButtonPress: function (oEvent) {
			/* ReservaEntity STRUCTURE
			"CompanhiaAerea": "AA", "NumeroConexao": "0017",
    		"DataVoo": "/Date(1579132800000)/", "NumeroReserva": "00000002",
    		"CodigoCliente": "00003133", "ClasseVoo": "C", 
        	"ValorPago": "999.99","Moeda": "USD"
			*/

			var resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oView = this.getView();
			var oReservaModel = this.getOwnerComponent().getModel("reservaVooModel");
			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext();

			//GET VALUES
			var sCompanhiaAerea = oView.byId("detailsHeader").getObjectSubtitle();
			var iNumeroConexao = oView.byId("detailsHeader").getObjectTitle();
			var oDataVoo = oContext.getProperty("DataVoo");
			var sFormatedDate = formatter._formatDate(oDataVoo);

			/*	var iCodigoCliente = oView.byId("clienteSelect").getSelectedKey();*/
			/* var classe de voo already set to the model */
			var iValorPago = oView.byId("PriceObjectHeader").getNumber();
			var iMoeda = oView.byId("PriceObjectHeader").getNumberUnit();

			//SET VALUES to the RESERVA AUXILIARY MODEL
			oReservaModel.setProperty("/CompanhiaAerea", sCompanhiaAerea);
			oReservaModel.setProperty("/NumeroConexao", iNumeroConexao);
			oReservaModel.setProperty("/DataVoo", sFormatedDate);
			/*		oReservaModel.setProperty("/CodigoCliente", iCodigoCliente);*/
			/* var classe de voo already set to the model */
			oReservaModel.setProperty("/ValorPago", iValorPago);
			oReservaModel.setProperty("/Moeda", iMoeda);

			/****@POST
			 **CREATE
			 **RESERVATION 
			 **IN "ReservaSet" */
			oReservaModel.refresh("true");
			var that = this;
			var oModelDB = this.getOwnerComponent().getModel();
			var oReservaModelOdata = oReservaModel.oData;
			MessageBox.confirm(resourceBundle.getText("BookMessage"), {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
					//	oModelDB.create("/ReservaSet", oReservaModelOdata);
						MessageToast.show(resourceBundle.getText("BookConfirmed"),{
							duration: 3000
						});
						var oCustomerSelected = that.byId("clienteSelect").getValue();
						that.byId("clienteSelect").setVisible(false);
						that.byId("customerIcon").setVisible(false);
						that.byId("bookButton").setEnabled(false)
												.setText("Reservation Completed in name of " + " *" + oCustomerSelected + "*" )
												.setType("Accept");
					} else if (sButton === MessageBox.Action.CANCEL) {
						MessageToast.show(resourceBundle.getText("BookCancel"));
					}
				}
			});
		},

		//valuehelp dialog methods for the choose client input
		onValueHelpRequest: function () {
			if (!this._oChooseClientDialog) {
				this._oChooseClientDialog = sap.ui.xmlfragment("pt.procensus.FlyWithSapApp.view.dialogs.ChooseClientDialog", this);
				this.getView().addDependent(this._oChooseClientDialog);
				this._oChooseClientDialog.open();
			} else {
				this._oChooseClientDialog.open();
			}
		},

		onValueHelpDialogClose: function (oEvent) {
			var oReservaModel = this.getOwnerComponent().getModel("reservaVooModel");

			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("clienteSelect");

			if (oSelectedItem === undefined) {
				oInput.setValue(undefined);
				return;
			} else {
				var aux = oSelectedItem.getTitle();
				oInput.setValue(aux);
				var iCodigoClient = oSelectedItem.getDescription();
				oReservaModel.setProperty("/CodigoCliente", iCodigoClient);
			}
		},

		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Nome", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		}

	});

});