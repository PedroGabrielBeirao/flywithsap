sap.ui.define([
	"sap/ui/core/library"
], function (coreLibrary) {
	"use strict";

	/* @Global
	 * Just For Simplification */
	var ValueState = coreLibrary.ValueState;

	return {

		//calculate the AVAILABLE SEATS - Lugares disponíveis
		calcSeats: function (iTotalLugares, iLugaresOcupados) {
			var aux = iTotalLugares - iLugaresOcupados;
			var availableSeats = aux > 0 ? aux : "No Seats for this class"; 
			return availableSeats;
		},

		// then try to dont repeat the code from above, how to call the variable from above
		availableSeatsStatus: function (iTotalLugares, iLugaresOcupados) {
			var iAvailableSeats = (iTotalLugares - iLugaresOcupados);
			if (iAvailableSeats >= 20) {
				return ValueState.Success;
			} else if (iAvailableSeats < 20 && iAvailableSeats > 10) {
				return ValueState.Warning;
			} else {
				return ValueState.Error;
			}
		},

		//then i will need to put the strings in resource bundle 
		// in how many days the costumer will arrive - após quantos dias o cliente chega ao destino
		calcDays: function (iDaysAfter) {
			if (iDaysAfter === 0) {
				return "";
			} else if (iDaysAfter === 1) {
				return "Arrive in " + iDaysAfter + " day";
			}
			return "Arrive in " + iDaysAfter + " days";
		},
		
		calcArrivalDate: function( departureDate , iDaysAfter ) {
			var incrementedDate = new Date(departureDate);
			incrementedDate.setDate(incrementedDate.getDate() + iDaysAfter);
			var dd = incrementedDate.getUTCDate();
        	var mm = incrementedDate.getMonth() + 1; //January is 0!
        	var yy = incrementedDate.getFullYear() - 2000;
			return (mm + "/" + dd + "/" + yy);
		}
		
		

	};
});