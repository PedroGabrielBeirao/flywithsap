sap.ui.define([
	"sap/ui/core/library"
], function (coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	return {

		//calculate the AVAILABLE SEATS - Lugares disponíveis
		calcSeats: function (iTotalLugares, iLugaresOcupados) {
			var aux = iTotalLugares - iLugaresOcupados;
			var availableSeats = aux > 0 ? aux : "No Seats for this class"; 
			return availableSeats;
		},

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
		
		availableSeatsStatusDetail: function (iAvailableSeats) {
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
			var aMonths = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
			var incrementedDate = new Date(departureDate);
			incrementedDate.setDate(incrementedDate.getDate() + iDaysAfter);
			var dd = incrementedDate.getUTCDate();
        	var monthIndex = incrementedDate.getMonth(); //January is 0!
        	var mm = aMonths[monthIndex];
        	var yy = incrementedDate.getFullYear();
			return (mm + " " + dd + "," + yy);
		},
		
		calcTime: function(departureDate,iDaysAfter,departureHour,arrivalHour){
	
			var departureDay = new Date(departureDate);
			var departureTime = new Date(departureDate).getTime();
			var arrivalDay = departureDay.setDate(departureDay.getDate() + iDaysAfter);
			var arrivalTime = new Date(arrivalDay).getTime();
			var iArrivalHour;
			var iDepartureHour;
			if(arrivalHour === null){
				iArrivalHour = 0;
			}else{
				iArrivalHour = arrivalHour.ms;
			}
			
			if(departureHour === null){
				iDepartureHour = 0;
			}else{
				iDepartureHour = departureHour.ms;
			}
			var resultingDepartureTime = departureTime + iDepartureHour;
			var resultingArrivalTime = arrivalTime + iArrivalHour;
			var durationMs = resultingArrivalTime - resultingDepartureTime;
			var durationHours = (0.001 / 3600) * durationMs;
			//convert the value
			var iHours = Math.floor(durationHours);
			var minutes = (durationHours - iHours) * 60;
			var iMinutes = Math.round(minutes);
			//finally return the duration of the flight
			return iHours + " " + "h" + " " + iMinutes + " " + "min";
		},
		
		
		_formatDate: function (departureDate) {
			var formatedDateToUnix = new Date(departureDate).getTime() / 1000;
			var sFormatedDate = "/Date(" + formatedDateToUnix + "000" + ")/";
			return (sFormatedDate);
		}
		
	};
});