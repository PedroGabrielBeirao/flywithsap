sap.ui.define([
	"pt/procensus/FlyWithSapApp/controller/BaseController",
	"../model/formatter",
	"sap/ui/core/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, formatter, coreLibrary, MessageBox, MessageToast) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

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
			
			//logic to hide the buttons when the there are no available seats
			var iAvailableSeats = this.getView().byId("SeatsObjectHeader").getNumber();
			this._bookButtonAble(iAvailableSeats);
	
		},
		_bookButtonAble : function (iAvailableSeats)  {
			var BookButton = this.getView().byId("bookButton");
			if (iAvailableSeats > 0 ) 
			{
				BookButton.setEnabled(true);
				BookButton.setType("Emphasized");
				BookButton.setText("BOOK NOW");
			}
			else{
			BookButton.setEnabled(false);
			BookButton.setType("Reject");
			BookButton.setText("Class not Available for this flight");
			}
		},

		_getFlightClassTemporary: function (sInputClass) {
			
			if (sInputClass === "Business Class") {
				var availableSeatsBus = this.getOwnerComponent().getModel("searchInputs").getProperty("/LugaresVaziosBus");
				this.getView().byId("SeatsObjectHeader").setNumber(availableSeatsBus);
				var sState = this._seatsStatusTemporary(availableSeatsBus);
				this.getView().byId("SeatsObjectHeader").setNumberState(sState);

			} else if (sInputClass === "Economy Class") {
				var availableSeatsEco = this.getOwnerComponent().getModel("searchInputs").getProperty("/LugaresVaziosEcon");
				this.getView().byId("SeatsObjectHeader").setNumber(availableSeatsEco);
				var sStateEco = this._seatsStatusTemporary(availableSeatsEco);
				this.getView().byId("SeatsObjectHeader").setNumberState(sStateEco);
			} else if (sInputClass === "First Class") {
				var availableSeats1aClass = this.getOwnerComponent().getModel("searchInputs").getProperty("/LugaresVaziosBus");
				this.getView().byId("SeatsObjectHeader").setNumber(availableSeats1aClass);
				var sState1aClass = this._seatsStatusTemporary(availableSeats1aClass);
				this.getView().byId("SeatsObjectHeader").setNumberState(sState1aClass);
			}
		},

		_seatsStatusTemporary: function (iAvailableSeats) {
			if (iAvailableSeats >= 20) {
				return ValueState.Success;
			} else if (iAvailableSeats < 20 && iAvailableSeats > 10) {
				return ValueState.Warning;
			} else {
				return ValueState.Error;
			}
		},

		formatDate: function (departureDate) {
			var formatedDateToUnix = new Date(departureDate).getTime() / 1000;
			var sFormatedDate = "/Date(" + formatedDateToUnix + "000" + ")/";
			return (sFormatedDate);
		},

		onCreateUser: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("createUser");
		},


/* book operations*/

		onBookButtonPress: function (oEvent) {
			/*
		"CompanhiaAerea": "AA",
        "NumeroConexao": "0017",
        "DataVoo": "/Date(1579132800000)/",
        "NumeroReserva": "00000002",
        "CodigoCliente": "00003133",
        "ClasseVoo": "C", tenhod e fazer o get do model
        "ValorPago": "999.99",
        "Moeda": "USD"
			*/
			var oReservaModel = this.getOwnerComponent().getModel("reservaVooModel");
			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext();

			//vou buscar os valores e associo os que faltam ao model reservaVoo
			var sCompanhiaAerea = this.getView().byId("detailsHeader").getObjectSubtitle(); //certo
			oReservaModel.setProperty("/CompanhiaAerea", sCompanhiaAerea);

			var iNumeroConexao = this.getView().byId("detailsHeader").getObjectTitle(); //certo
			oReservaModel.setProperty("/NumeroConexao", iNumeroConexao);

			var oDataVoo = oContext.getProperty("DataVoo");
			var sFormatedDate = this.formatDate(oDataVoo);

			oReservaModel.setProperty("/DataVoo", sFormatedDate);
			
			var iCodigoCliente = this.getView().byId("clienteSelect").getSelectedKey(); //ir buscar ao input que ainda nao fiz
			oReservaModel.setProperty("/CodigoCliente", iCodigoCliente);
			//classe de voo ja esta no model
			var iValorPago = this.getView().byId("PriceObjectHeader").getNumber();
			oReservaModel.setProperty("/ValorPago", iValorPago);

			var iMoeda = this.getView().byId("PriceObjectHeader").getNumberUnit();
			oReservaModel.setProperty("/Moeda", iMoeda);

			/*All needed data set to the model at this point*/

			/*DO THE POST REQUEST*/
			oReservaModel.refresh("true");
			var oModelDB = this.getOwnerComponent().getModel();
			var oReservaModelOdata = oReservaModel.oData;
			
			MessageBox.confirm("Book this flight confirmation, [OK].", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sButton) {
					if(sButton === MessageBox.Action.OK ){
					oModelDB.create("/ReservaSet", oReservaModelOdata);
					
						MessageToast.show("Congratulations, your flight is booked , we fly together!");
						}
					else if(sButton === MessageBox.Action.CANCEL) {
						MessageToast.show("Reservation Cancelled");
					}
				}
			});
			
		}
	
	});

});