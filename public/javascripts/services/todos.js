angular.module('todoService', [])

	// super simple service
	// each function returns a promise object 
	.factory('OTP_GENERATE', ['$http',function($http) {
		return {
			create : function(todoData) {
				return $http.post('/twilio/generate_otp', todoData);
			}
		}
	}])
    .factory('OTP_VERIFY', ['$http',function($http) {
        return {
            create : function(todoData) {
                return $http.post('/twilio/verify_otp', todoData);
            }
        }
    }]);