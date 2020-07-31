sap.ui.define([
	"pt/procensus/FlyWithSapApp/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, History, JSONModel, Core, SimpleType, ValidateException, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("pt.procensus.FlyWithSapApp.controller.createUser", {
		/*************code needed for the form validation- took from samples minor changes  ******************/
		onInit: function () {
			var oView = this.getView(),
				oMM = Core.getMessageManager();
			oView.setModel(new JSONModel({
				Name: "",
				Address: "",
				Language: "",
				Phone: "",
				Email: ""
			}));
			// attach handlers for validation errors
			oMM.registerObject(oView.byId("clientName"), true);
			oMM.registerObject(oView.byId("clientAddress"), true);
			oMM.registerObject(oView.byId("clientLanguage"), true);
			oMM.registerObject(oView.byId("clientPhone"), true);
			oMM.registerObject(oView.byId("clientEmail"), true);
		},

		_validateInput: function (oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var oBinding = oInput.getBinding("value");

			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
			}

			oInput.setValueState(sValueState);

			return bValidationError;
		},

		onInputChange: function (oEvent) {
			var oInput = oEvent.getSource();
			this._validateInput(oInput);
		},

		/** took from samples
		 * Custom model type for validating an E-Mail address
		 * @class
		 * @extends sap.ui.model.SimpleType
		 */
		customEMailType: SimpleType.extend("email", {
			formatValue: function (oValue) {
				return oValue;
			},

			parseValue: function (oValue) {
				//parsing step takes place before validating step, value could be altered here
				return oValue;
			},

			validateValue: function (oValue) {
				// The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
				// It's always better to validate an address by simply sending an e-mail to it.
				var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!oValue.match(rexMail)) {
					throw new ValidateException("'" + oValue + "' is not a valid e-mail address");
				}
			}

		}),

		/*************************************************************************/
		
		_getRegistrationDialog: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("pt.procensus.FlyWithSapApp.view.dialogs.SuccesfulRegistrationDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		onOpenRegistrationDialog: function () {
			this._createClient();

		},
		onCloseRegistrationDialog: function () {
			this._getRegistrationDialog().close();
		},

		onNavToHome: function () {
			this.getRouter().navTo("home", {}, true);
		},


		_createClient: function () {

			var oView = this.getView();
			var oModelDB = this.getOwnerComponent().getModel();

			var aInputs = [
				oView.byId("clientName"),
				oView.byId("clientAddress"),
				oView.byId("clientPhone"),
				oView.byId("clientLanguage"),
				oView.byId("clientEmail")
			];
			var bValidationError = false;

			// Check that inputs are not empty.
			// Validation does not happen during data binding as this is only triggered by user actions.
			aInputs.forEach(function (oInput) {
				bValidationError = this._validateInput(oInput) || bValidationError;
			}, this);

			if (!bValidationError) {
				this._saveToModel();
				var oClientModel = this.getOwnerComponent().getModel("clientModel");
				var oClientOdata = oClientModel.oData;
				oModelDB.create("/ClienteSet", oClientOdata);
				this._getRegistrationDialog().open();
			} else {
				MessageBox.alert("A validation error has occurred.Please check your input values");
			}
		},

		//Save user inputs to the local cliendModel 
		_saveToModel: function () {
			var oView = this.getView();
			var oClientModel = this.getOwnerComponent().getModel("clientModel");
			var sNome = oView.byId("clientName").getValue();
			oClientModel.setProperty("/Nome", sNome);

			var sMorada = oView.byId("clientAddress").getValue();
			oClientModel.setProperty("/Morada", sMorada);

			var sPhone = oView.byId("clientPhone").getValue();
			oClientModel.setProperty("/Telefone", sPhone);

			var sIdioma = oView.byId("clientLanguage").getValue();
			oClientModel.setProperty("/Idioma", sIdioma);

			var sEmail = oView.byId("clientEmail").getValue();
			oClientModel.setProperty("/Email", sEmail);
		}
	});

});