angular.module('todoController', [])

// inject the Todo service factory into our controller
    .controller('mainController', ['$scope', '$http', 'OTP_GENERATE', 'OTP_VERIFY', function ($scope, $http, OTP_GENERATE, OTP_VERIFY) {
        $scope.formData = {};

        // CREATE ==================================================================
        // when submitting the add form, send the text to the node API
        $scope.createTodo = function () {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            if ($scope.formData.name !== undefined && $scope.formData.email !== undefined
                && $scope.formData.address !== undefined && $scope.formData.contact !== undefined) {
                // call the create function from our service (returns a promise object)
                console.log($scope.formData)
                OTP_GENERATE.create("{\"number\":"+$scope.formData.contact+"}")
                // if successful creation, call our get function to get all the new todos
                .success(function(data) {
                        console.log('SUCCESS');
                        // $scope.formData = {}; // clear the form so our user is ready to enter another
                        // $scope.todos = data; // assign our new list of todos
                });
                $('#modalSubscribe').modal('show');
            }
        };

        $scope.verifyOTP = function () {
            console.log($scope.formData)
            console.log($scope.formData.otp_number)
            if ($scope.formData.otp_number !== undefined) {
                var otpModel = {};
                otpModel.contactNumber = $scope.formData.contact;
                otpModel.otp = $scope.formData.otp_number;
                otpModel.name = $scope.formData.name;
                otpModel.email = $scope.formData.email;
                otpModel.address = $scope.formData.address;
                console.log(otpModel)
                OTP_VERIFY.create(otpModel)
                    .success(function (data) {
                        console.log("HElooooo VERIFY SUCCESS ");
                        console.log(data);
                        if (data === 'Organization and Agent Created') {
                            $('#modalSubscribe').modal('hide');
                        }else{

                        }
                    })
            }
        };

        $scope.searchTicket = function () {

            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            if ($scope.formData.search) {
                // call the create function from our service (returns a promise object)
                console.log($scope.formData)
                OTP_GENERATE.create("{\"number\":"+$scope.formData.contact+"}")
                // if successful creation, call our get function to get all the new todos
                    .success(function(data) {
                        console.log('SUCCESS');
                        // $scope.formData = {}; // clear the form so our user is ready to enter another
                        // $scope.todos = data; // assign our new list of todos
                    });
                $('#modalSubscribe').modal('show');
            }
        };

        // DELETE ==================================================================
        // delete a todo after checking it
        $scope.deleteTodo = function (id) {

            // Todos.delete(id)
            // 	// if successful creation, call our get function to get all the new todos
            // 	.success(function(data) {
            // 		$scope.todos = data; // assign our new list of todos
            // 	});
        };
    }]);