/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"pt/procensus/FlyWithSapApp/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"pt/procensus/FlyWithSapApp/test/integration/pages/App",
	"pt/procensus/FlyWithSapApp/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "pt.procensus.FlyWithSapApp.view.",
		autoWait: true
	});
});