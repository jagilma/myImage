'use strict';
/**
 * @ngdoc function
 * @name myImageApp.controller:modelCtrl
 * @description
 * # MainCtrl
 * Controller of the myImageApp
 */
angular.module('myImageApp')
  .controller('modelDecodeCtrl', ['$base64','$scope', '$route', 'fileReader', 'misAlertas', '$rootScope', '$translate','$log', '$uibModal', 'ngProgressLite','dialogs','localStorageService','myConfig', 'Upload', '$http',
  function ($base64, $scope,$route,fileReader,misAlertas,$rootScope,$translate,$log,$uibModal,ngProgressLite,dialogs,localStorageService,myConfig,Upload,$http) {
	 $scope.image={name:'', description:'', data: '', encrypted:'',message:'',password:'',msgEncrypted:'',method:'',progress: 0, decoded:false,url:''}; //La que estamos manejando
	 $scope.images=[];
	 //$scope.imagesSetUP={message:'',password:'',method:''};
	 $scope.imagesSetUP=myConfig.getConfig();
	 $scope.dataImage={};
	 $scope.userForm = {};
	 $scope.cryptographicFunctions=[{method:'AES'}, {method:'SHA-512'},{method:'HMAC-SHA512'}];
	 $scope.dataToLocalStorage=localStorageService.get('myMarkedImages')||[];	  
	 $scope.max = 3;
	 $scope.checked=false;
	 //$scope.selectedIndex = 1;
	 setTimeout(function(){ //Chapuza para que no dé un error tipo: DOM Manipulation in transclude function leads to exception in compositeLinkFn en https://github.com/angular/angular.js/issues/7344
	   jQuery('#wizard').bwizard();
	 }, 0);

	 //jQuery('#wizard').bwizard();
	 $scope.nextTab = function() {
	 	/*var index = ($scope.selectedIndex == $scope.max) ? 0 : $scope.selectedIndex + 1;
	 	$scope.selectedIndex = index;*/
	 	jQuery('#wizard').bwizard("next");
	 };
	 $scope.changeLanguage = function (langKey) {
	    $translate.use(langKey);
	 };
	 $scope.cierraAlerta=function(indice){
	 	return misAlertas.cierraAlerta(indice);
    };
  	 $scope.muestraAlerta=function(tipo,msj){
	 	 return misAlertas.muestraAlerta(tipo,msj);
  	 };
  	 $scope.getSelectedImages=function () {
  	 	return $scope.selectedImages;
  	 };
  	 $scope.check = function(value) {
    	var idx=$scope.selectedImages.indexOf(value);
		if (idx >= 0) { //era idx y  && !checked
    	 		$scope.selectedImages.splice(idx, 1); //era idx
   		}
   		if (idx < 0) { //era idx y  && checked
      			$scope.selectedImages.push(value); //era value
		}
		$scope.checked=($scope.selectedImages.length>0);
  	 };
  	 $scope.switchCheck = function() {
		$scope.checked=!($scope.selectedImages.length>0);
		if (! $scope.checked) {
			$scope.selectedImages=[];
		}
		for (var i=0; i<$scope.images.length; i++) {
			$scope.images[i].checked=$scope.checked;		
			if ($scope.checked) {
				$scope.selectedImages.push(i);
			}
		}
  	 };

	 $scope.showForm = function (image) {
	 		var vm = this;
	 		$scope.userForm.text=image.message;
  			$scope.userForm.password=image.password;
  			$scope.userForm.method=image.method;
	      var modalInstance = $uibModal.open({
	          templateUrl: 'views/modal-form-material-decode.html',
	          controller: 'ModalInstanceCtrl',
	          scope: $scope,
	          resolve: {
	              userForm: function () {
	              	var index=$scope.images.indexOf(image);
	              	if (index<0) {
	               		$scope.userForm.text=$scope.imagesSetUP.message;
	               		$scope.userForm.password=$scope.imagesSetUP.password;
	               		$scope.userForm.method=$scope.imagesSetUP.method;
	                  return $scope.userForm;
	               }
	               else {
	               	if (typeof image.message !== 'undefined' && image.message !== "") {
	               		$scope.userForm.text=image.message;
	               		$scope.userForm.password=image.password;
	               		$scope.userForm.method=image.method;	               		
	              		}
	              		else {
	               		$scope.userForm.text=$scope.imagesSetUP.message;
	               		$scope.userForm.password=$scope.imagesSetUP.password;
	               		$scope.userForm.method=$scope.imagesSetUP.method;
	              		}	
							return $scope.userForm;
	               }
	              }
	          }
	      });
	
	      modalInstance.result.then(function (selectedItem) {
	          $scope.selected = selectedItem;
	          if (selectedItem =='ok') {
	          	$scope.saveMessage(vm.image)
	          	return;
	          }
	          
	      }, function () {
	          $log.info('Modal dismissed at: ' + new Date());
	          //$scope.userForm={};
	      });
	      /*modalInstance.result.finally(function(image) {
	     			$scope.saveMessage(vm.image);//vm.
	     			//$scope.nextTab();
	     	});*/      
	 };
	 //var lang=$translate.proposedLanguage();
	 //Detecta la entrada
    if (! $route.current.regexp.test('/history'))
    	$scope.muestraAlerta('warning',$translate.instant('SELECT_IMAGE'));//'Selecciona la imagen a marcar');
    	$scope.saveMessage = function (image) {
    	var index=$scope.images.indexOf(image);
    	if (! angular.isDefined($scope.userForm)) {
    		$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
    	}    	
    	if (index>=0){
	  		$scope.images[index].message=$scope.userForm.text;
  			$scope.images[index].password=$scope.userForm.password;
  			$scope.images[index].method=$scope.userForm.method;
  		}
  		else {
  			//all of them
  			$scope.imagesSetUP.message=$scope.userForm.text;
  			$scope.imagesSetUP.password=$scope.userForm.password;
  			$scope.imagesSetUP.method=$scope.userForm.method;
  			myConfig.setConfig($scope.imagesSetUP);
  		}
  	 };
	 $scope.$watch('files', function () {
        $scope.readFiles($scope.files);
     });
	 $scope.readFiles = function (files) {		 
        if (files && files.length) {
			//console.log("Subiendo %d ficheros", files.length);
			ngProgressLite.start();
			Upload.base64DataUrl(files).then(function(result) {
				for (var i = 0; i < files.length; i++) {
						$scope.image.name=files[i].name;
                        $scope.image.data = result[i]; //$scope.image.data = result;
                        if (typeof $scope.imagesSetUP.message !== 'undefined'  && $scope.imagesSetUP.message !== "") {
                          	$scope.image.message=$scope.imagesSetUP.message;
                          	$scope.image.password=$scope.imagesSetUP.password;
                          	$scope.image.method=$scope.imagesSetUP.method;
                        }
                        $scope.images.push($scope.image);
                        $scope.image={};
				}                
			});
			ngProgressLite.done();
			$scope.nextTab();
        }
    };  	 
	function _arrayBufferToBase64(buffer) {
		var binary = '';
		var bytes = new Uint8Array(buffer);
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	}
	$scope.getFileFromURL = function(image) {
		$http({
			method: 'GET',
			url: image.url,
			responseType: 'arraybuffer'
		}).then(function(response) {
			//console.log("IMAGE URL:",response);
			//var str = _arrayBufferToBase64(response.data);
			//console.log(str);
			// str is base64 encoded.
			var string=image.url.split('/');
			$scope.image.name=string[string.length-1];
			//console.log("Nombre:", $scope.image.name);
			var typeImg=$scope.image.name.split('.')[1];
			$scope.image.data="data:image/" + typeImg + ";base64," + _arrayBufferToBase64(response.data);
			$scope.image.url=image.url;
			//console.log("image;", $scope.image);
			$scope.images.push($scope.image);
			$scope.image={};
			$scope.nextTab();
			//$scope.name=la parte final de la url
		}, function(response) {
			console.error('error in getting static img');
			$scope.muestraAlerta('danger',$translate.instant('DONT_GET_IMAGE_URL'));
		});		
	};
    $scope.$on("fileProgress", function(e, progress) {
        $scope.image.progress = progress.loaded / progress.total;
    });
    $scope.checkAll = function () {
    	if ($scope.selectedImages !== [] && $scope.selectedImages.length>0) {
	    	var msg=$translate.instant('CHECKALL_MSG');
	    	var dlg = dialogs.confirm(msg);
	    	dlg.result.then(function(btn){
		    	ngProgressLite.start();
			   for (var img=0; img<$scope.selectedImages.length;img++) {
		   	 		$scope.checkImage($scope.images[$scope.selectedImages[img]],false);
		    	}
		    	$scope.nextTab();
	    		ngProgressLite.done();
	      });
	   }
   	else {
	   	$scope.muestraAlerta('danger',$translate.instant('SELECT_IMAGE'));
	   }
    };
    
    $scope.checkImage = function (image,next) {
    	if (next) {
    		ngProgressLite.start();
    	}
		  image.msgEncrypted=steg.decode(image.data);//$scope.image.data);
		  if (typeof image.password === 'undefined' || image.password === '') {
			  	//image.password=$scope.userForm.password;
			  	image.password=$scope.imagesSetUP.password;
		  }
		  	
		  if (typeof image.method === 'undefined' || image.method === '') {
		  	//image.method=$scope.userForm.method;
		  	image.method=$scope.imagesSetUP.method
		  }
		  if (typeof image.message === 'undefined' || image.message === '') {
		  	//image.message=$scope.userForm.text;
		  	image.message=$scope.imagesSetUP.message;
		  }
		  
		  var msg="";
		  if (typeof image.msgEncrypted === 'undefined' || image.msgEncrypted === "") {
		  		$scope.muestraAlerta('warning',$translate.instant('DONT_ENCRYPTED_IMAGE'));
		  		//image.message=$translate.instant('DONT_ENCRYPTED_IMAGE');
		  		image.decoded=false;
		  }
		  else {
			  //console.log("msgEncrypted:", image.msgEncrypted);
			  //console.log("message:", image.message);
			  if (image.msgEncrypted == image.message){
				  $scope.muestraAlerta('success',$translate.instant('TEXT_IMAGE')+": '"+image.message+"'");
				  image.decoded=true;
			  }
			  else if (typeof image.password !== 'undefined' && image.password !== "") {	                          	
		     		switch(image.method) {
		     			case 'AES':
		     					msg=CryptoJS.AES.decrypt(image.msgEncrypted, image.password).toString(CryptoJS.enc.Utf8);//
		     					if (typeof msg !== 'undefined' && msg !== "") {
	     							$scope.muestraAlerta('success',$translate.instant('TEXT_IMAGE')+": '"+msg+"'");
	     							image.encrypted=image.data; //$scope.image.encrypted=$scope.image.data;
	     							image.decoded=true;
	     							image.message=msg;
		     					}
		     					else {
	     							$scope.muestraAlerta('danger',$translate.instant('CANT_DECODE')+": '"+msg+"'");
	     							image.decoded=false;
		     					}
		     					break;
		     			case 'SHA-512':
		     					msg=CryptoJS.SHA512(image.message).toString(CryptoJS.enc.Base64);
		     					//var msg2=CryptoJS.SHA512($scope.image.msgEncrypted).toString(CryptoJS.enc.Base64);
		     					if (msg === image.msgEncrypted) {
		     						//image.message=$scope.userForm.text;
		     						$scope.muestraAlerta('success',$translate.instant('TEXT_IMAGE')+": '"+image.message+"'");
		     						image.decoded=true;
		     					}
		     					else {
		     						$scope.muestraAlerta('warning',$translate.instant('DONT_MATCH_TEXT_IMAGE')+": '"+image.message+"'");
		     						image.decoded=false;
		     						//image.message="We don't know it";
		     					}
		     					break;
		     			case 'HMAC-SHA512':
		     					msg=CryptoJS.HmacSHA512(image.message, image.password).toString(CryptoJS.enc.Base64);
		     					if (msg === image.msgEncrypted) {
		     						//image.message=$scope.userForm.text;
		     						$scope.muestraAlerta('success',$translate.instant('TEXT_IMAGE')+": '"+image.message+"'");
		     						image.decoded=true;
		     					}
		     					else {
		     						$scope.muestraAlerta('warning',$translate.instant('DONT_MATCH_TEXT_IMAGE')+": '"+image.message+"'");
		     						image.decoded=false;
		     						//image.message="We don't know it";
		     					}
		     					break;
		     			default:
		     					image.message=image.msgEncrypted;
		     					image.decoded=true;
		     					//$scope.muestraAlerta('warning',"XXX");
		     					$scope.muestraAlerta('success',$translate.instant('TEXT_IMAGE')+": '"+image.message+"'");
		     					//image.message="We don't know it";
		     					break;		     				                          					
		     		}
		     }
		     else {
		     	$scope.muestraAlerta('warning',$translate.instant('CHECK_IMAGE'));
		     	image.decoded=false;
		     }
		  }
		  if (next) {
		  	ngProgressLite.done();
		  }
    };
    $scope.deleteImage = function (image) {
    	image.progress=0;
    	if (typeof image !== 'undefined') {
	    	var index=$scope.images.indexOf(image);
	    	if (index>=0) {
	    		$scope.images.splice(index,1);
	    		$scope.selectedImages.sort();
	    		var idx=$scope.selectedImages.indexOf(index) 
				if (idx>=0) {
	    			$scope.selectedImages.splice(idx,1);
					for (var i=idx; i<$scope.selectedImages.length;i++) {
						$scope.selectedImages[i]-=1;
					}
	    		}
	    	}
	    }    	
    };
    $scope.deleteAll = function (image) {
   	if ($scope.selectedImages === [] || $scope.selectedImages.length<1) {
    		$scope.muestraAlerta('danger',$translate.instant('SELECT_IMAGE'));
    		return;
    	}
    	var msg=$translate.instant('DELETEALL_MSG');
   	var dlg = dialogs.confirm(msg);
    	dlg.result.then(function(btn){
	    	$scope.selectedImages.sort()
			for (var i=$scope.selectedImages.length-1;i>-1;i--) {    	
	    		$scope.deleteImage($scope.images[$scope.selectedImages[i]]);
	    	} 
	    	$scope.checked=false;   	
      });
    };
    function convertDataURIToBinaryFF(dataURI) {
		 var BASE64_MARKER = ';base64,'; 
   	 	var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length; 
	    var raw = window.atob(dataURI.substring(base64Index));
   	 	return Uint8Array.from(Array.prototype.map.call(raw,function(x) { 
            return x.charCodeAt(0); 
        })); 
	};
}]);
