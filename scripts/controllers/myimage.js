'use strict';
/**
 * @ngdoc function
 * @name myImageApp.controller:modelCtrl
 * @description
 * # MainCtrl
 * Controller of the myImageApp
 */
angular.module('myImageApp')
  .controller('modelCtrl', 
  ['$base64','$scope', '$sce', '$route', '$window', '$http', "$q",'misAlertas', '$rootScope', '$translate','$log', '$uibModal', 'ngProgressLite', 'dialogs', 'localStorageService','myConfig','myImages','Upload','$timeout',
  function ($base64, $scope,$sce, $route,$window,$http,$q,misAlertas,$rootScope,$translate,$log,$uibModal,ngProgressLite,dialogs,localStorageService,myConfig,myImages,Upload,$timeout) {
	 $scope.init=function() {
		$scope.positions=[  {position: 'Northwest', value: 'nw'}, {position: 'North', value: 'n'}, {position: 'Northeast', value: 'ne'}, 
							{position: 'West', value : 'w'},{position: 'East', value : 'e'}, {position: 'Southwest', value :'sw'}, 
							{position: 'South', value: 's'}, {position: 'Southeast', value:'se' }]
		$scope.images=[];//If no indexDB, both of this var have the same data.
		$scope.dataSavedOnLocalStorage=myImages.getImages();//loadImages();;//localStorageService.get('myMarkedImages')||[]; 
		$scope.itemsByPage=5;
		$scope.server="mundoerrante.net";//localhost";
		//$scope.server='localhost';
		$scope.checked=false;
		$scope.selectedImages=[];
		$scope.tablamyImagesData=[];
		$scope.modalShown = false;
		$scope.imagesSetUP=myConfig.initSetUP();
		$scope.dataImage={};
		$scope.userForm = {};
		$scope.cryptographicFunctions=[{method:'AES'}, {method:'SHA-512'},{method:'HMAC-SHA512'}];		
		$scope.decoding=false;
		$scope.maxSizeFile=3*1024*1024;
		$scope.maxSizeFileBana=5*1024*1024;
		$scope.maxSizeFileFB=4*1024*1024;
		
		$scope.muestraAlerta=function(tipo,msj){
			return misAlertas.muestraAlerta(tipo,msj);
		};
		if (! $route.current.regexp.test('/history'))
			$scope.muestraAlerta('warning',$translate.instant('SELECT_IMAGE'));//'Selecciona la imagen a marcar');
		setTimeout(function(){ //Chapuza para que no dé un error tipo: DOM Manipulation in transclude function leads to exception in compositeLinkFn en https://github.com/angular/angular.js/issues/7344
			jQuery('#wizard').bwizard();
		}, 0);		
	 }
	 	 
     $scope.cancel = function () {
		 $scope.imagesSetUP=myConfig.initSetUP();
     };
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
  	 $scope.getSelectedImages=function () {
  	 	return $scope.selectedImages;
  	 };
	/*
	$scope.$on("showImages", function(event, src,pos) {
		console.log("Recibido showIMages: ",src);
 		var canvas = document.getElementById('CV-3SencryptedContent'+pos);
    	var context = canvas.getContext('2d');
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;
		canvas.setAttribute('width', 304);
      	canvas.setAttribute('height', 236);
		var image = new Image();
		image.onload = function() {
			//canvas.width= image.width;
			//canvas.height=image.height
			context.drawImage(image, 0, 0,304,236);
		};
		image.src=src;
	 });
	 */
  	 $scope.check=function(value,type) {
		var index;
		if (type === "enconde") {
			index=value;
		}else if (type=== "historico") {
			index=$scope.dataSavedOnLocalStorage.indexOf(value);
		}
		else if (type=== "importData"){
			index=$scope.tablamyImagesData.indexOf(value);
		}
		else {
			index=$scope.images.indexOf(value);
		}
		if (index>=0) {
	    	var idx=$scope.selectedImages.indexOf(value);
			if (idx >= 0) { //era idx y  && !checked
     	 		$scope.selectedImages.splice(idx, 1); //era idx
    		}
    		if (idx < 0) { //era idx y  && checked
      			$scope.selectedImages.push(value); //era value
    		}
		}
		$scope.checked=($scope.selectedImages.length>0);
  	 };	
  	 $scope.switchCheck = function(images,type) {
		$scope.checked=!($scope.selectedImages.length>0);
		if (! $scope.checked) {
			$scope.selectedImages=[];
		}
		for (var i=0; i<images.length; i++) {
			images[i].checked=$scope.checked;
			if ($scope.checked) {
				if (type === "encode") {
					$scope.selectedImages.push(i);
				}
				else if(type === "historico") {
					$scope.selectedImages.push(images[i]);
				}
			}
		}		
	};
	 
	 $scope.infoImage = function (image,cypherData) {
		 //Ventana modal con toda la información de la imagen
		 var vm = this;
	     var modalInstance = $uibModal.open({
	          templateUrl: 'views/myImageInfo.html',
	          controller: 'ModalInstanceCtrl',
	          scope: $scope,
			  resolve: {
		    	userForm: function() //scope del modal
		        {
		          	$scope.name=image.name;
					$scope.hash=image.hash;
					$scope.date=image.date;
					$scope.data=image.data;
					$scope.encryptedData=cypherData;
		        }
		    }
	      });
		  modalInstance.result.then(function (selectedItem) {			 
	          
	      }, function () {
	          $log.info('Modal dismissed at: ' + new Date());
	          //$scope.userForm={};
	      });
	 };
	$scope.$watch('files', function () {
	//$scope.getFiles = function(files) {
        $scope.readFiles($scope.files).then(function(images) {
			$scope.muestraAlerta('success',$translate.instant('Imágenes cargadas'));
		})
		.catch(function(err){
			$scope.muestraAlerta('warning',$translate.instant(err));
		});
     });
	 $scope.getMark = function(file){
		Upload.base64DataUrl(file).then(function(url) {
			$scope.imagesSetUP.watermarkImage.name=url;
		});
	 }
	 $scope.readFiles = function (files) {
		var defered = $q.defer();		 
        if (files && files.length) {
			console.log("Subiendo %d ficheros", files.length);
			ngProgressLite.start();
			Upload.base64DataUrl(files).then(function(urls) {
				for (var i = 0; i < files.length; i++) {
					//if (files[i].size > $scope.maxSizeFile) {
					if (urls[i].size > $scope.maxSizeFile) {						
								$scope.muestraAlerta('warning',$translate.instant('IMAGE_SO_BIG'));
								$scope.muestraAlerta('warning',$translate.instant('TAM:'+files[i].size));
					}
					var image={
										name:files[i].name,
										hash:'', date:'',
										checked: false, description:'', data: '',
										encryptedData: [ /*{encrypted:'',  message:'', msgEncrypted:'',password:'',method:'',
										saved: [], //{ name:'', date:''}
										twitter: []} //¿N veces? --> [] //{ tweet:'', id:'', date: '', url:''}
										facebook: []} //¿N veces? --> [] //{ message:'', id:'', date: '', post_id:''}*/
										//pinterest: [] // Ne veces -> {board:'', note:'', date:'', id:'', post_id:'', url:''}
										//flickr: [] // Ne veces -> {	description: '',title:'',tags: '',photo:'',is_public: false,is_friend: false,is_family: false,hidden:true,id_resp:'',date:'' }
										],
										progress: 0
					};
					image.name = files[i].name;
					image.data = urls[i];//result; //$scope.image.data = result;
					image.date = new Date();
					image.hash = CryptoJS.SHA512(image.data).toString(CryptoJS.enc.Base64);
					var dEncrypted={
						encrypted:'',  message:'', msgEncrypted:'',password:'',method:'',
						saved: [], //{ name:'', date:''}
						watermarkImage: {
							name:"", opacity:0.7, margin:12, gravity: "south", message: "",textsize:12, textcolor:'black',done:false
						},
						twitter: [],
						facebook: [],
						pinterest:[],
						flickr:[]
					}; 
					//console.log("image data:",$scope.image);
					if ((typeof $scope.imagesSetUP.message !== 'undefined'  && $scope.imagesSetUP.message !== "")
						|| (typeof $scope.imagesSetUP.watermarkImage.message !== 'undefined'  && $scope.imagesSetUP.watermarkImage.message !== "") 
						|| (typeof $scope.imagesSetUP.watermarkImage.name !== 'undefined'  && $scope.imagesSetUP.watermarkImage.name !== "")) {
						dEncrypted.password=$scope.imagesSetUP.password;
						dEncrypted.method=$scope.imagesSetUP.method;
						dEncrypted.watermarkImage.opacity=$scope.imagesSetUP.watermarkImage.opacity;
						dEncrypted.watermarkImage.gravity=$scope.imagesSetUP.watermarkImage.gravity;
						dEncrypted.watermarkImage.margin=$scope.imagesSetUP.watermarkImage.margin;
						dEncrypted.watermarkImage.message=$scope.imagesSetUP.watermarkImage.message;
						dEncrypted.watermarkImage.name=$scope.imagesSetUP.watermarkImage.name;
						dEncrypted.watermarkImage.textcolor=$scope.imagesSetUP.watermarkImage.textcolor;
						dEncrypted.watermarkImage.textsize=$scope.imagesSetUP.watermarkImage.textsize;

						dEncrypted.twitter= [];//[{ tweet:'', id:'', date: '', url:''}];
						dEncrypted.facebook= [];//[{ post_id:'', id:'', date: '', message:''}];
						dEncrypted.pinterest=[];//{board:'', note:'', date:'', id:'', link:'', url:''}
						dEncrypted.flickr= []; //{description: '',title:'',tags: '',photo:'',is_public: false,is_friend: false,is_family: false,hidden:true,id_resp:'',date:'' }
						dEncrypted.saved= [];//[{ name:'', date: '' }];
						dEncrypted.message=$scope.imagesSetUP.message;
						image.encryptedData.push(dEncrypted); 
					}
					$scope.images.push(image);
				}                
				ngProgressLite.done();
				$scope.nextTab();
				defered.resolve($scope.images);
			})
			.catch(function(err){
				defered.reject($translate.instant('NO_FILES_1'));
			});
        }
		else {
			defered.reject($translate.instant('NO_FILES_2'));
		}
		return defered.promise;
    };
  	$scope.showFormTW = function (image,way) {
	 	var vm = this;
		var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
		if (image.encryptedData[i].encrypted.length>$scope.maxSizeFile){
			$scope.muestraAlerta('danger',$translate.instant('IMAGE_SO_BIG')+":TWITTER");
			$scope.muestraAlerta('danger','ENCRYPTED SIZE:'+image.encryptedData[i].encrypted.length+'>3MB');
			return;
		}
	    var modalInstance = $uibModal.open({
	        templateUrl: 'views/modal-formTW.html',
	        controller: 'ModalInstanceCtrl',
	        scope: $scope,
	        resolve: {
	              userForm: function () {					
					var t=(image.encryptedData[i].twitter.length>0 ? image.encryptedData[i].twitter.length-1:0);  
	               	if (typeof  image.encryptedData[i] !== 'undefined' && typeof  image.encryptedData[i].twitter[t] !== 'undefined' 
					    && typeof image.encryptedData[i].twitter[t].tweet !== 'undefined' && image.encryptedData[i].twitter[t].tweet !== "") {
	               		$scope.userForm.text=image.encryptedData[i].twitter[t].tweet;
	              	}
	              	return $scope.userForm;
	               }
	        }			  
	    });
		modalInstance.result.then(function (selectedItem) {			 
	        $scope.selected = selectedItem;
	        if (selectedItem =='ok') {
	          	$scope.saveMessageTW(vm.image,way);
				$scope.$broadcast("sendTweet", vm.image);
			  	return;
	        }
	          
	    }, function () {
	          $log.info('Modal dismissed at: ' + new Date());
	    });
	};
	$scope.showFormFB = function (image,way) {
		var vm = this;
		var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
		if (image.encryptedData[i].encrypted.length>$scope.maxSizeFileFB){
			$scope.muestraAlerta('danger',$translate.instant('IMAGE_SO_BIG')+":Facebook");
			$scope.muestraAlerta('danger','ENCRYPTED SIZE:'+image.encryptedData[i].encrypted.length+'>4MB');
			return;
		}
	    var modalInstance = $uibModal.open({
	          templateUrl: 'views/modal-formFB.html',
	          controller: 'ModalInstanceCtrl',
	          scope: $scope,
	          resolve: {
	              userForm: function () {					
					var t=(image.encryptedData[i].facebook.length>0 ? image.encryptedData[i].facebook.length-1:0);  
	               	if (typeof  image.encryptedData[i] !== 'undefined' && typeof  image.encryptedData[i].facebook[t] !== 'undefined' 
					    && typeof image.encryptedData[i].facebook[t].message !== 'undefined' && image.encryptedData[i].facebook[t].message !== "") {
	               		$scope.userForm.text=image.encryptedData[i].facebook[t].message;
	              	}
	              	return $scope.userForm;
	               }
	          }			  
	    });
		modalInstance.result.then(function (selectedItem) {			 
	          $scope.selected = selectedItem;
	          if (selectedItem =='ok') {
	          	$scope.saveMessageFB(vm.image,way);
				$scope.$broadcast("sendPostFB", vm.image);
				return;
	          }
	          
	    }, function () {
	          $log.info('Modal dismissed at: ' + new Date());
	    });
	};
	$scope.showFormPint = function (image,way) {
	 	var vm = this;
		var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
    	if (image.encryptedData[i].encrypted.length>$scope.maxSizeFileBana){
			$scope.muestraAlerta('danger',$translate.instant('IMAGE_SO_BIG')+":SERVER LIMIT");
			$scope.muestraAlerta('danger','ENCRYPTED SIZE:'+image.encryptedData[i].encrypted.length+'>127MB');
			return;
		}

	    var modalInstance = $uibModal.open({
	        templateUrl: 'views/modal-formPint.html',
	        controller: 'ModalInstanceCtrl',
	        scope: $scope,
	        resolve: {
	              userForm: function () {					
					var t=(image.encryptedData[i].pinterest.length>0 ? image.encryptedData[i].pinterest.length-1:0);  
	               	if (typeof  image.encryptedData[i] !== 'undefined' && typeof  image.encryptedData[i].pinterest[t] !== 'undefined' 
					    && typeof image.encryptedData[i].pinterest[t].note !== 'undefined' && image.encryptedData[i].pinterest[t].note !== "") {
	               		$scope.userForm.note=image.encryptedData[i].pinterest[t].note;
						$scope.userForm.board=image.encryptedData[i].pinterest[t].board;
	              	}
	              	return $scope.userForm;
	               }
	        }			  
	    });
		modalInstance.result.then(function (selectedItem) {			 
	          $scope.selected = selectedItem;
	          if (selectedItem =='ok') {
	          	$scope.saveMessagePint(vm.image,way);
				$scope.$broadcast("sendPostPint", vm.image);
				  return;
	          }
	          
	    }, function () {
	          $log.info('Modal dismissed at: ' + new Date());
	    });
	};
	$scope.showFormFlickr = function (image,way) {
	 	  var vm = this;
		   var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
	 		if (image.encryptedData[i].encrypted.length>$scope.maxSizeFileBana){
				$scope.muestraAlerta('danger',$translate.instant('IMAGE_SO_BIG')+":SERVER LIMIT");
				$scope.muestraAlerta('danger','ENCRYPTED SIZE:'+image.encryptedData[i].encrypted.length+'>127MB');
				return;
			}

	      var modalInstance = $uibModal.open({
	          templateUrl: 'views/modal-formFlickr.html',
	          controller: 'ModalInstanceCtrl',
	          scope: $scope,
	          resolve: {
	              userForm: function () {					
					var t=(image.encryptedData[i].flickr.length>0 ? image.encryptedData[i].flickr.length-1:0);  
	               	if (typeof  image.encryptedData[i] !== 'undefined' && typeof  image.encryptedData[i].flickr[t] !== 'undefined' 
					    && typeof image.encryptedData[i].flickr[t].description !== 'undefined' && image.encryptedData[i].flickr[t].description !== "") {
	               		$scope.userForm.description=image.encryptedData[i].flickr[t].description;
						$scope.userForm.tags=image.encryptedData[i].flickr[t].tags;
						$scope.userForm.title=image.encryptedData[i].flickr[t].title;
						$scope.userForm.is_public=image.encryptedData[i].flickr[t].is_public;
						$scope.userForm.is_friend=image.encryptedData[i].flickr[t].is_friend;
						$scope.userForm.is_family=image.encryptedData[i].flickr[t].is_family;
						$scope.userForm.hidden=image.encryptedData[i].flickr[t].hidden;
	              	}
	              	return $scope.userForm;
	               }
	          }			  
	      });
		  modalInstance.result.then(function (selectedItem) {			 
	          $scope.selected = selectedItem;
	          if (selectedItem =='ok') {
	          	$scope.saveMessageFlickr(vm.image,way);
				$scope.$broadcast("sendPostFlickr", vm.image);
				  return;
	          }
	          
	      }, function () {
	          $log.info('Modal dismissed at: ' + new Date());
	      });
	 };
	 $scope.showForm = function (image) {
	 	  var vm = this;
	      var modalInstance = $uibModal.open({
	          templateUrl: 'views/modal-form-material.html',
	          controller: 'ModalInstanceCtrl',
	          scope: $scope,
	          resolve: {
	              userForm: function () {
	              	var index=$scope.images.indexOf(image);
	              	if (index<0) {
	               		$scope.userForm.text=$scope.imagesSetUP.message;
	               		$scope.userForm.password=$scope.imagesSetUP.password;
	               		$scope.userForm.method=$scope.imagesSetUP.method;
						$scope.userForm.opacity=$scope.imagesSetUP.watermarkImage.opacity;
						$scope.userForm.gravity=$scope.imagesSetUP.watermarkImage.gravity;
						$scope.userForm.margin=$scope.imagesSetUP.watermarkImage.margin;
						$scope.userForm.messageWM=$scope.imagesSetUP.watermarkImage.message;
						$scope.userForm.file=$scope.imagesSetUP.watermarkImage.name;
						$scope.userForm.textcolor=$scope.imagesSetUP.watermarkImage.textcolor;
						$scope.userForm.textsize=$scope.imagesSetUP.watermarkImage.textsize;

	                  return $scope.userForm;
	               }
	               else {
					var num=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
					/*if ((typeof image.encryptedData.message !== 'undefined' && image.encryptedData.message !== "") 
					   || (typeof image.encryptedData.watermarkImage.message !== 'undefined'  && image.encryptedData.watermarkImage.message !== "") 
					   || (typeof image.encryptedData.watermarkImage.name !== 'undefined'  && image.encryptedData.watermarkImage.name !== "")){*/
					if (typeof image.encryptedData[num] !== 'undefined') {
	               		$scope.userForm.text=image.encryptedData[num].message;
	               		$scope.userForm.password=image.encryptedData[num].password;
	               		$scope.userForm.method=image.encryptedData[num].method;	               		
						$scope.userForm.opacity=image.encryptedData[num].watermarkImage.opacity;
						$scope.userForm.gravity=image.encryptedData[num].watermarkImage.gravity;
						$scope.userForm.margin=image.encryptedData[num].watermarkImage.margin;
						$scope.userForm.messageWM=image.encryptedData[num].watermarkImage.message;
						$scope.userForm.file=image.encryptedData[num].watermarkImage.name;
						$scope.userForm.textcolor=image.encryptedData[num].watermarkImage.textcolor;
						$scope.userForm.textsize=image.encryptedData[num].watermarkImage.textsize;

	              	}
	              	else {
	               		$scope.userForm.text=$scope.imagesSetUP.message;
	               		$scope.userForm.password=$scope.imagesSetUP.password;
	               		$scope.userForm.method=$scope.imagesSetUP.method;
						$scope.userForm.opacity=$scope.imagesSetUP.watermarkImage.opacity;
						$scope.userForm.gravity=$scope.imagesSetUP.watermarkImage.gravity;
						$scope.userForm.margin=$scope.imagesSetUP.watermarkImage.margin;
						$scope.userForm.messageWM=$scope.imagesSetUP.watermarkImage.message;
						$scope.userForm.file=$scope.imagesSetUP.watermarkImage.name;
						$scope.userForm.textcolor=$scope.imagesSetUP.watermarkImage.textcolor;
						$scope.userForm.textsize=$scope.imagesSetUP.watermarkImage.textsize;
	              	}
					return $scope.userForm;
	              }
	             }
	         }
	      });
	
	      modalInstance.result.then(function (selectedItem) {
	          $scope.selected = selectedItem;
	          if (selectedItem =='ok') {
	          	$scope.saveMessage(vm.image);
	          	return;
	          }	          
	      }, function () {
	          $log.info('Modal dismissed at: ' + new Date());
	      });
	 }; //$scope.publishTweet = 
	 $scope.$on("sendTweet", function (evt, image) {
    		$scope.tweet(image)
			.then(function(text) {
				$scope.dataSavedOnLocalStorage=myImages.addImage(image,'twitter');
				//$scope.dataSavedOnLocalStorage=$scope.saveAllOnLocalStorage();
				misAlertas.muestraAlerta('success',text);
			})
			.catch(function(err){
				misAlertas.muestraAlerta('danger',err);
			});			
	 });
	 $scope.$on("sendPostFB", function (evt, image) {
			$scope.share(image) //lo llevo al showForm
			.then(function() {
				misAlertas.muestraAlerta('success',$translate.instant('FB_POST_PUBLISH'));
				$scope.dataSavedOnLocalStorage=myImages.addImage(image,'facebook');
			})
			.catch(function(err){
				misAlertas.muestraAlerta('danger',err);
			});
			//$scope.dataSavedOnLocalStorage=$scope.saveAllOnLocalStorage();
	 });
	 $scope.$on("sendPostPint", function (evt, image) {
			$scope.pint(image)
				.then(function(text) {
						$scope.dataSavedOnLocalStorage=myImages.addImage(image,'pinterest');
						misAlertas.muestraAlerta('success',text);
						var param= {'rrss':'PINTEREST', 'msg':'Imagen subida correctamente'};
						return $http.post('https://'+ $scope.server + '/myImage/rest/setData.php',param, {
							headers : { 'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'}
						});												
						//$scope.dataSavedOnLocalStorage=$scope.saveAllOnLocalStorage();
				})
				.then(function(dataReq) {
							console.log("Apunte estadístico ha sido registrado");
				},function(err){
							console.log("Apunte estadístico ha fallado:"+err);
				})
				.catch(function(err){
						misAlertas.muestraAlerta('danger',err);
				});			
	 });
	  $scope.$on("sendPostFlickr", function (evt, image) {
			$scope.flickr(image)
			.then(function(text) {
				$scope.dataSavedOnLocalStorage=myImages.addImage(image,'flickr');
				//$scope.dataSavedOnLocalStorage=$scope.saveAllOnLocalStorage();
				misAlertas.muestraAlerta('success',text);
			})
			.catch(function(err){
				misAlertas.muestraAlerta('danger',err);
			});			
	 });
    
    /*$scope.saveAllOnLocalStorage=function(){
		//I will not save in LocalStorage or indexDB. If I want it, I will need to Uncomment next line
		//$scope.dataSavedOnLocalStorage=myImages.saveImages();
		return $scope.dataSavedOnLocalStorage;
	};*/
	$scope.saveConfig=function() {
		myConfig.setConfig($scope.imagesSetUP);
  	}
	/*$scope.exportAll=function() {
		myImages.exportMyImages();
	}
	$scope.importAll=function(esAnadirAmyImagesData){
		if (! $scope.selectedImages.length>0) { //MODIFICADO '='
	 		$scope.muestraAlerta("warming",$translate.instant('DONT_SELECTED_IMAGE_TO_UP'));
	 		return;
	 	}
	 	if (! esAnadirAmyImagesData) {
			 $scope.dataSavedOnLocalStorage=myImages.importMyImages($scope.selectedImages);
			 $scope.dataSavedOnLocalStorage=myImages.saveImages();
	 	}
	   else {
	 		angular.forEach($scope.selectedImages, function (image) {
	 			$scope.dataSavedOnLocalStorage=myImages.addImage(image,'all');
			});
	   }	   
	   $scope.muestraAlerta("success",$translate.instant('END_UPLOADING'));
	}*/
	$scope.loadJSON=function($filecontent) {
		//console.log("carga JSON iniciada");
	 	$scope.muestraAlerta("info", $translate.instant('START_UPLOADING'));
  	 	$scope.tablamyImagesData = JSON.parse($filecontent); //JSON.stringify($fileContent);
  	 	$scope.muestraAlerta("success",$translate.instant('END_UPLOADING'));
	}	
	/*$scope.clearAll=function() {
		if ($scope.dataSavedOnLocalStorage.length<1) {
			$scope.muestraAlerta('warning',$translate.instant('ADVICE_SAVEDATA'));
		}
		else {
			//$scope.selectedImages=$scope.stSelectRow;
			if ($scope.selectedImages === [] || $scope.selectedImages.length<1) {
					$scope.muestraAlerta('danger',$translate.instant('SELECT_IMAGE'));
					return;
			}
			var msg=$translate.instant('DELETEALL_MSG');
			var dlg = dialogs.confirm(msg);
				dlg.result.then(function(btn){
					//$scope.selectedImages.sort();
					for (var i=$scope.selectedImages.length-1;i>-1;i--) {    	
						//$scope.deleteImage($scope.dataSavedOnLocalStorage[$scope.selectedImages[i]]);
						//console.log("IMG",$scope.selectedImages[i]);						
						$scope.dataSavedOnLocalStorage=myImages.deleteImage($scope.selectedImages[i],'otro');
						$scope.selectedImages.splice(i,1);
					} 
					$scope.checked=false;   	
			});
			//$scope.muestraAlerta('success',$translate.instant('SUCCESS_SAVEDATA'));
			
		}
		return $scope.dataSavedOnLocalStorage;
	};*/
	
    $scope.signAll= function () {
    	ngProgressLite.start();
    	if ($scope.selectedImages === [] || $scope.selectedImages.length<1) {
    		$scope.muestraAlerta('danger',$translate.instant('SELECT_IMAGE'));
			ngProgressLite.done();
    		return;
    	}
		var msg=$translate.instant('SIGNALL_MSG');   	
   		var dlg = dialogs.confirm(msg);
    	dlg.result.then(function(btn){
			var signImages=[];
			for (var img=0; img<$scope.selectedImages.length;img++) {
	    		 signImages.push($scope.signImage($scope.images[$scope.selectedImages[img]],$scope.selectedImages[img],false));
	    	}	
			return $q.all(signImages);
		})
		.then(function(){
				$scope.nextTab();
		})
		.catch(function(err){
				$scope.muestraAlerta('danger',err);
		})
		.finally(function(){
				ngProgressLite.done();
		});    		
    };
    /*$scope.setFile = function(element) {
        $scope.$apply(function() {	
            $scope.imagesSetUP.watermarkImage.name = element.files[0].name;
			//console.log("WATER:", element.files[0]);
        });
    };*/	
	function stego(image,next) {
		var defered = $q.defer();		
		var msg=$translate.instant('STEGO_MSG');   	
   		var dlg = dialogs.confirm(image.name+": "+msg);
		console.log("DOING STEGO");
    	dlg.result.then(function(btn){
				if (next) {
					ngProgressLite.start();
				}				
				var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
				//console.log("IMAGEN A INSERTAR INFO:", image);
				if (typeof image.encryptedData[i].password !== 'undefined' && typeof image.encryptedData[i].password !== "") {
					if (typeof image.encryptedData[i].method !== 'undefined' && typeof image.encryptedData[i].method != "") {
						switch(image.encryptedData[i].method) {
							case 'AES':
								image.encryptedData[i].msgEncrypted=CryptoJS.AES.encrypt(image.encryptedData[i].message, image.encryptedData[i].password).toString();//encrypt
								break;
							case 'SHA-512':
								image.encryptedData[i].msgEncrypted=CryptoJS.SHA512(image.encryptedData[i].message).toString(CryptoJS.enc.Base64);
								break;
							case 'HMAC-SHA512':
								image.encryptedData[i].msgEncrypted=CryptoJS.HmacSHA512(image.encryptedData[i].message, image.encryptedData[i].password).toString(CryptoJS.enc.Base64);
								break;	                          					    			
						};
					}
					else {
						misAlertas.muestraAlerta('danger',$translate.instant('NO_ENCRYP_METHOD_MSG'));
						if (next) {
							ngProgressLite.done();
						}
						defered.reject($translate.instant('NO_ENCRYP_METHOD_MSG'));
						return defered.promise;
					}
				}
				else {
					misAlertas.muestraAlerta('warning',$translate.instant('NO_PASSWORD'));
					image.encryptedData[i].msgEncrypted=image.encryptedData[i].message;
				}
				image.encryptedData[i].encrypted = steg.encode(image.encryptedData[i].msgEncrypted, image.data, {"width": image.width, "height": image.height});
				if (next) {				
					ngProgressLite.done();
					//$scope.$emit('showImages', image.encryptedData[i].encrypted,i);
					$scope.nextTab();					
				}
				defered.resolve(image);								
		})
		.catch(function(err) {
				defered.reject(err);
		});
		return defered.promise;
	};
	function watermark(image,pos,next) {
		var defered = $q.defer();  
		var promise = defered.promise;
		var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
		console.log("DOING WATERMARK");
		if (doWatermark(image)) {
			var msg=$translate.instant('WATERMARK_MSG');   	
   			var dlg = dialogs.confirm(image.name+": "+msg);
    		dlg.result.then(function(btn){
				if (next) {
					ngProgressLite.start();
				}				
				var string="img[id][name$='encryptedContent"+(pos)+"']";
				jQuery( string ).watermark({ 	
					path: image.encryptedData[i].watermarkImage.name, 
					text: image.encryptedData[i].watermarkImage.message,
					textSize:image.encryptedData[i].watermarkImage.textsize,
					textColor: image.encryptedData[i].watermarkImage.textcolor,
					gravity: image.encryptedData[i].watermarkImage.gravity,
					opacity: image.encryptedData[i].watermarkImage.opacity, 
					margin: image.encryptedData[i].watermarkImage.margin, 
					outputWidth: 'auto', outputHeight: 'auto',
					done: function (imgURL) {
						this.src = imgURL;
						if (next) {				
							ngProgressLite.done();
							$scope.nextTab();
						}
						image.encryptedData[i].watermarkImage.done=true;
						defered.resolve(imgURL);						
					}//,
				});
			})
			.catch(function(err) {
				defered.reject(err);
			});
		}
		else {
			defered.reject($translate.instant('NOWATERMARK_MSG'));
		}
		return promise;
	};
	function doWatermark(image) {
		var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
		return !(((typeof image.encryptedData[i].watermarkImage.message === 'undefined' || image.encryptedData[i].watermarkImage.message === "" ) &&
				 (typeof image.encryptedData[i].watermarkImage.name === 'undefined' || image.encryptedData[i].watermarkImage.name === "")) ||
				 (image.encryptedData[i].watermarkImage.done))
	}
	function doStego(image) {
		var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
		return ! (typeof image.encryptedData[i].message === 'undefined' || typeof image.encryptedData[i].message === "" )
	}
	function onlyWaterMark(image) {
		if (doStego(image)) {
			return false;
		}
		return doWatermark(image);
	}
	
	function onlyStego(image) {
		if (doWatermark(image)) {
			return false;
		}
		return doStego(image);
	}
    $scope.signImage = function (image,pos,next) {
		var defered = $q.defer();
		if (typeof image === 'undefined')  {
			misAlertas.muestraAlerta('danger',$translate.instant('FIRST_IMAGE'));
			defered.reject($translate.instant('FIRST_IMAGE'));
			return defered.promise;
		}
		var i=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
		if (typeof image.encryptedData[i] === 'undefined') {
			misAlertas.muestraAlerta('danger',$translate.instant('FIRST_IMAGE'));
			defered.reject($translate.instant('FIRST_IMAGE'));
			return defered.promise;
		}
		if (doStego(image) && doWatermark(image)) {
    		watermark(image,pos,next).then(function(img) {
            		image.data = img;
					return stego(image,next);
		    }, function(err) {
					misAlertas.muestraAlerta('danger','ERROR:'+err);
					return stego(image,next);
			}).then(function(img) {
						console.log("Tamaño tras marcas seleccionadas: water - " +img.data.length+" - stego - "+ img.encryptedData[i].encrypted.length);
						defered.resolve();
			})
		 	.catch(function(err) {
        		    // Tratar el error
					misAlertas.muestraAlerta('danger','ERROR:'+err);
					defered.reject(err);
     		});
    		return defered.promise;
		}
		else {
			if (image.encryptedData[i].watermarkImage.done) {
				$scope.muestraAlerta('warning',$translate.instant('ALREADY_MARKED_MSG'));
			}
			if (doStego(image)) {
				stego(image,next).then(function(img) {
					console.log("Tamaño tras marcas seleccionadas: water - " +img.data.length+" - stego - "+ img.encryptedData[i].encrypted.length);
					defered.resolve();
				})
				.catch(function(err) {
					// Tratar el error
					misAlertas.muestraAlerta('danger','ERROR:'+err);
					defered.reject(err);
				});
				return defered.promise;
			}
			else if (doWatermark(image)) {
				watermark(image,pos,next).then(function(img) {
						image.data = img;
						defered.resolve();	
				})
				.catch(function(err) {
						// Tratar el error
						misAlertas.muestraAlerta('danger',err);
						defered.reject(err);
				});
				return defered.promise;
			}
			else {
				$scope.muestraAlerta('danger',$translate.instant('MODALFORM_MSG'));
				defered.reject($translate.instant('MODALFORM_MSG'));
				return defered.promise;;			
			}
		}
		return defered.promise;
    };
    
    $scope.saveMessage = function (image) {
    	var index=$scope.images.indexOf(image);
    	if (! angular.isDefined($scope.userForm)) {
    		$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
    	}    	
    	if (index>=0){			
			var dEncrypted={
								encrypted:'',  message:'', msgEncrypted:'',password:'',method:'',
								saved: [], //{ name:'', date:''}
								watermarkImage:{
									name:"", opacity:0.7, margin:12, gravity: "south", message: "",textsize:12,textcolor:'black',done:false
								},
								twitter: [],
								facebook:[]
			};
			var i=$scope.images[index].encryptedData.length>0 ? $scope.images[index].encryptedData.length-1:0;
			image.encryptedData[i].password=$scope.userForm.password;
			image.encryptedData[i].method=$scope.userForm.method;
			image.encryptedData[i].message=$scope.userForm.text;
			image.encryptedData[i].watermarkImage.opacity=$scope.userForm.opacity;
			image.encryptedData[i].watermarkImage.gravity=$scope.userForm.gravity;
			image.encryptedData[i].watermarkImage.margin=$scope.userForm.margin;
			image.encryptedData[i].watermarkImage.message=$scope.userForm.messageWM;
			image.encryptedData[i].watermarkImage.name=$scope.userForm.file;
			image.encryptedData[i].watermarkImage.textcolor=$scope.userForm.textcolor;
			image.encryptedData[i].watermarkImage.textsize=$scope.userForm.textsize;
			image.encryptedData[i].twitter= [];//[{ tweet:'', id:'', date: '', url:''}];
			image.encryptedData[i].facebook= [];//[{ message:'', id:'', date: '', post_id:''}];
			image.encryptedData[i].pinterest=[]; //{board:'', note:'', date:'', id:'', post_id:'', url:''} 
			image.encryptedData[i].flickr=[];//{	description: '',title:'',tags: '',photo:'',is_public: false,is_friend: false,is_family: false,hidden:true,id_resp:'',date:'' }
			image.encryptedData[i].saved= [];//[{ name:'', date: '' }];			
            //$scope.images[index].encryptedData.push(dEncrypted);			
  		}
  		else {
  			//all of them
  			$scope.imagesSetUP.message=$scope.userForm.text;
  			$scope.imagesSetUP.password=$scope.userForm.password;
  			$scope.imagesSetUP.method=$scope.userForm.method;
			$scope.imagesSetUP.watermarkImage.opacity=$scope.userForm.opacity;
			$scope.imagesSetUP.watermarkImage.gravity=$scope.userForm.gravity;
			$scope.imagesSetUP.watermarkImage.margin=$scope.userForm.margin;
			$scope.imagesSetUP.watermarkImage.message=$scope.userForm.messageWM;
			$scope.imagesSetUP.watermarkImage.name=$scope.userForm.file;
			$scope.imagesSetUP.watermarkImage.textcolor=$scope.userForm.textcolor;
			$scope.imagesSetUP.watermarkImage.textsize=$scope.userForm.textsize;
  			//myConfig.setConfig($scope.imagesSetUP);
			$scope.saveConfig();
  		}
  	 };
	 $scope.saveMessageTW = function (image, way) {
    	var images;
		if (way === "otro") {
			images=$scope.images;
		}
		else{
			images=$scope.dataSavedOnLocalStorage;
		}
		var index=images.indexOf(image);
    	if (! angular.isDefined($scope.userForm)) {
    		$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
    	} 
    	if (index>=0){
			var infoTweet={ tweet:'', id:'', date: '', url:''};
			var i=images[index].encryptedData.length>0 ? images[index].encryptedData.length-1:0;
			infoTweet.tweet=$scope.userForm.text;
	  		images[index].encryptedData[i].twitter.push(infoTweet);
		}
  		else {
  			//all of them
			$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
  		}
  	};
	$scope.saveMessageFB = function (image, way) {
    	var images;
		if (way === "otro") {
			images=$scope.images;
		}
		else{
			images=$scope.dataSavedOnLocalStorage;
		}
		var index=images.indexOf(image);
    	if (! angular.isDefined($scope.userForm)) {
    		$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
    	} 
    	if (index>=0){
			var infoFB={ message:'', id:'', date: '', post_id:''};
			var i=images[index].encryptedData.length>0 ? images[index].encryptedData.length-1:0;
			infoFB.message=$scope.userForm.text;
	  		images[index].encryptedData[i].facebook.push(infoFB);
			//console.log("Guardado mensaje del form en estructura IMG:", images[index].encryptedData[i].facebook.length);
	  		//$scope.dataSavedOnLocalStorage=myImages.addImage($scope.images[index]);
  		}
  		else {
  			//all of them
			$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
  		}
  	};
	 $scope.saveMessagePint = function (image, way) {
    	var images;
		if (way === "otro") {
			images=$scope.images;
		}
		else{
			images=$scope.dataSavedOnLocalStorage;
		}
		var index=images.indexOf(image);
    	if (! angular.isDefined($scope.userForm)) {
    		$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
    	} 
    	if (index>=0){
			var infoPint={board:'', note:'', date:'', id:'', post_id:'', url:''};
			var i=images[index].encryptedData.length>0 ? images[index].encryptedData.length-1:0;
			infoPint.board=$scope.userForm.board;
			infoPint.note=$scope.userForm.note;
	  		images[index].encryptedData[i].pinterest.push(infoPint);
			//console.log("Guardado mensaje del form en estructura IMG:", images[index].encryptedData[i].pinterest.length);
	  		//$scope.dataSavedOnLocalStorage=myImages.addImage($scope.images[index]);
  		}
  		else {
  			//all of them
			$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
  		}
  	};
	  $scope.saveMessageFlickr = function (image, way) {
    	var images;
		if (way === "otro") {
			images=$scope.images;
		}
		else{
			images=$scope.dataSavedOnLocalStorage;
		}
		var index=images.indexOf(image);
    	if (! angular.isDefined($scope.userForm)) {
    		$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
    	} 
    	if (index>=0){
			var infoFlickr= {description: '',title:'',tags: '',photo:'',is_public: false,is_friend: false,is_family: false,hidden:true,id_resp:'',date:'' };
			var i=images[index].encryptedData.length>0 ? images[index].encryptedData.length-1:0;
			infoFlickr.description=$scope.userForm.description;
			infoFlickr.tags=$scope.userForm.tags;
			infoFlickr.title=$scope.userForm.title;
			infoFlickr.is_public=$scope.userForm.is_public;
			infoFlickr.is_friend=$scope.userForm.is_friend;
			infoFlickr.is_family=$scope.userForm.is_family;
			infoFlickr.hidden=$scope.userForm.hidden;
	  		images[index].encryptedData[i].flickr.push(infoFlickr);
			//console.log("Guardado mensaje del form en estructura IMG:", images[index].encryptedData[i].flickr.length);
	  		//$scope.dataSavedOnLocalStorage=myImages.addImage($scope.images[index]);
  		}
  		else {
  			//all of them
			$scope.muestraAlerta('danger',$translate.instant('ERROR_FORM_IMG'));//'Selecciona la imagen a marcar');
  		}
  	};
    
    $scope.deleteImage = function (image, way) {
    	image.progress=0;
		var idx;
    	if (typeof image !== 'undefined') {	    	
	    		if (way === "otro") {
					var index=$scope.images.indexOf(image);
					if (index>=0) {
						$scope.images.splice(index,1);
					}
					$scope.selectedImages.sort();
					idx=$scope.selectedImages.indexOf(index); 					
				}
				else {
					idx=$scope.selectedImages.indexOf(image); // REVISAR SI ACTIVO HISTÓRICO
				}
				$scope.dataSavedOnLocalStorage=myImages.deleteImage(image); //Se borrará en Histórico	    			    		
				if (idx>=0) {
	    			$scope.selectedImages.splice(idx,1);
					for (var i=idx; i<$scope.selectedImages.length;i++) {
						$scope.selectedImages[i]-=1;
					}
	    		}
				$scope.muestraAlerta('success',$translate.instant('IMAGE_DELETED'));
	    }    	
		else {
			$scope.muestraAlerta('danger',$translate.instant('SELECT_IMAGE'));
		}
		image.progress=100;
    };
    $scope.deleteAll = function () {
    	if ($scope.selectedImages === [] || $scope.selectedImages.length<1) {
    		$scope.muestraAlerta('danger',$translate.instant('SELECT_IMAGE'));
    		return;
    	}
    	var msg=$translate.instant('DELETEALL_MSG');
   		var dlg = dialogs.confirm(msg);
    	dlg.result.then(function(btn){
	    	$scope.selectedImages.sort()
			for (var i=$scope.selectedImages.length-1;i>-1;i--) {    	
	    		$scope.deleteImage($scope.images[$scope.selectedImages[i]],'otro');
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
	/*$scope.setDataToLocalStorage = function (string) {
		if ($scope.dataToLocalStorage.length<1) {
			$scope.muestraAlerta('warning',$translate.instant('ADVICE_SAVEDATA'));
		}		 
		localStorageService.set(string, $scope.dataToLocalStorage);
		$scope.muestraAlerta('success',$translate.instant('SUCCESS_SAVEDATA'));
	};*/
   $scope.saveImageToDisk = function (image) {
	   var defered = $q.defer();
		var i=image.encryptedData.length>0 ? image.encryptedData.length-1:0;
		if (typeof image.encryptedData[i] === 'undefined' || image.encryptedData[i] === []) { //AÑADIDO LUNES 21/11 POR LA TARDE
			$scope.muestraAlerta('danger',$translate.instant('SIGN_IMAGE'));
			defered.reject($translate.instant('SIGN_IMAGE'));
			return defered.promise;
		}
		if (typeof image.encryptedData[i].encrypted === 'undefined' || image.encryptedData[i].message === "") {
			$scope.muestraAlerta('danger',$translate.instant('SIGN_IMAGE'));
			defered.reject($translate.instant('SIGN_IMAGE'));
			return defered.promise;
		}
    	image.progress=0;
		var imgData;
		var blob;
		var filename;
		if (image.encryptedData[i].encrypted === "" && image.encryptedData[i].watermarkImage.done){
		    //var img=document.getElementById("3SencryptedContent"+i).src;
			var img=image.data
			imgData = convertDataURIToBinaryFF(img);//image.data);
			blob = new Blob([imgData]);
			filename=image.name+"-stego-version"+image.name.substring(image.name.lastIndexOf(".")).toLowerCase();
		}
		else {
			//var img=document.getElementById("3SencryptedContent"+i).src;
			var img = image.encryptedData[i].encrypted;
			imgData = convertDataURIToBinaryFF(img);//image.encryptedData[i].encrypted);
			blob = new Blob([imgData], { type:"image/png" });
			filename=image.name+"-stego-version"+".png";//+image.name.name.substring(archivo.lastIndexOf("."))).toLowerCase();
		}
    	ngProgressLite.start();    			 
		var url = window.URL.createObjectURL(blob);
		try {
			if (/\bMSIE\b|\bTrident\b/.test(navigator.userAgent)) {
				window.navigator.msSaveOrOpenBlob(blob, filename);
			} else {
					var url  = window.URL || window.webkitURL,
						link = document.createElementNS("http://www.w3.org/1999/xhtml", "a"),
						event = document.createEvent("MouseEvents");
					
					link.href = url.createObjectURL(blob);
					link.download = filename;
	
					event.initEvent("click", true, false);
					link.dispatchEvent(event);
			}	          	//return deferred.promise;
			image.progress=100;
			var infoLocalSaved={ name:'', date:''};
			infoLocalSaved.name=filename;
			infoLocalSaved.date=new Date();
			image.encryptedData[i].saved.push(infoLocalSaved);
			$scope.dataSavedOnLocalStorage=myImages.addImage(image,'saved');		
			defered.resolve();
		} catch (er) {
			$scope.muestraAlerta('danger',err);
			defered.reject(err);
		}
		ngProgressLite.done();
		return defered.promise;
    };
		
    $scope.saveAll = function (image) {
		var defered = $q.defer();
    	if ($scope.selectedImages === [] || $scope.selectedImages.length<1) {
    		$scope.muestraAlerta('danger',$translate.instant('SELECT_IMAGE'));
			defered.reject($translate.instant('SELECT_IMAGE'));
    		return defered.promise;
    	}
    	var msg=$translate.instant('SAVEALL_MSG');
   		var dlg = dialogs.confirm(msg);
    	dlg.result.then(function(btn) {
			var saveImages=[];
	    	$scope.selectedImages.sort()
			for (var i=$scope.selectedImages.length-1;i>-1;i--) { 
	    		 saveImages.push($scope.saveImageToDisk($scope.images[$scope.selectedImages[i]]));
	    	}	
			return $q.all(saveImages);
      	})
		.then(function(){
				console.log("Saved");
		})
		.catch(function(err){
				$scope.muestraAlerta('danger',err);
		})
		.finally(function(){
				ngProgressLite.done();
		});
    };
	/* FACEBOOK*/
	function fbUpload(token, image){
		var defered = $q.defer();		
		var e=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
		var i=(image.encryptedData[e].facebook.length>0 ? image.encryptedData[e].facebook.length-1:0);		
		var dataURL;//split(',')[1];//dataURL.substring(dataURL.indexOf(',')+1, dataURL.length);		
		var blob;
		var filename;

		if (image.encryptedData[e].encrypted === "" && image.encryptedData[e].watermarkImage.done){
			dataURL= image.data;//split(',')[1];//dataURL.substring(dataURL.indexOf(',')+1, dataURL.length);		
			filename=image.name+"-stego-version"+image.name.substring(image.name.lastIndexOf(".")).toLowerCase();
		}
		else {
			dataURL= image.encryptedData[e].encrypted;//split(',')[1];//dataURL.substring(dataURL.indexOf(',')+1, dataURL.length);		
			filename=image.name+"-stego-version"+".png";//+image.name.name.substring(archivo.lastIndexOf("."))).toLowerCase();
		}		
		blob = dataURItoBlob(dataURL);
		var formData = new FormData()
		formData.append('token', token)
		formData.append('source', blob)
		formData.append('message', image.encryptedData[e].facebook[i].message)

		var xhr = new XMLHttpRequest();
		xhr.open( 'POST', 'https://graph.facebook.com/me/photos?access_token=' + token, true )
		xhr.onload = function() {
			//console.log( xhr.responseText )			
			image.encryptedData[e].facebook[i].post_id=xhr.responseText_post_id;
			image.encryptedData[e].facebook[i].id=xhr.responseText.id;
			image.encryptedData[e].facebook[i].date=new Date();
			defered.resolve('success');			
		}
		xhr.onerror = function (err) {
			defered.reject(err);
		}
		xhr.send( formData )
		return defered.promise;
	}

	function dataURItoBlob(dataURI) {
		var byteString = atob(dataURI.split(',')[1]);
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
		return new Blob([ab], { type: 'image/jpeg' });
	}

	$scope.share = function(image){
		var defered=$q.defer();
		//console.log("Entrando en share");
		var name=(image.name.substr(0,image.name.indexOf("."))).toLowerCase()+".png";
		//console.log("El nombre sera:", name);
		//FB.login(function(response) {
		/*FB.getLoginStatus(function(response) {
			if (response.authResponse) {
				PostImage(image,name,response.authResponse.accessToken);
			}
		});*/
		FB.login(function(response) {
			if (response.authResponse) {
				var access_token = FB.getAuthResponse()['accessToken'];
				fbUpload(access_token, image)
					.then(function() {
						var param= {'rrss':'FACEBOOK', 'msg':'Imagen subida correctamente'};
						return $http.post('https://'+ $scope.server + '/myImage/rest/setData.php',param, {
								headers : { 'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'}
							});						
					}).then(function(dataReq){						
						console.log("Apunte estadístico ha sido registrado");
						defered.resolve();
					},function(err){
						console.log("Apunte estadístico NO ha sido registrado: "+err);
						defered.resolve();
					})
					.catch(function(err){						
						defered.reject($translate.instant('FB_POST_NOT_PUBLISH')+":"+err);
					});
			} else {
				var e=(image.encryptedData.length>0 ? image.encryptedData.length-1:0);
				var i=(image.encryptedData[e].facebook.length>0 ? image.encryptedData[e].facebook.length-1:0);
				image.encryptedData[e].facebook[i].message='User cancelled login or did not fully authorize!!!';
				defered.reject($translate.instant('FB_POST_NOT_PUBLISH')+' User cancelled login or did not fully authorize!!!');
			}
		}, {scope: 'user_photos,publish_actions'});
		return defered.promise;
	}
	/* FIN FACEBOOK*/
	/* TWITTER */
	$scope.tweet = function(img){
        var deferred = $q.defer();		
        var urlTweet="https://"+ $scope.server + "/myImage/rest/twitter.php"
        var e=(img.encryptedData.length>0 ? img.encryptedData.length-1:0);      
        var i=(img.encryptedData[e].twitter.length>0 ? img.encryptedData[e].twitter.length-1:0);
		var media;		
		if (img.encryptedData[e].encrypted === "" && img.encryptedData[e].watermarkImage.done){
			media=img.data.split(',')[1];
		}
		else {
        	media=img.encryptedData[e].encrypted.split(',')[1];	
		}
        var param= {'status':img.encryptedData[e].twitter[i].tweet, 'media':media, 'name':img.name, 'id':img.hash,
			'method': '', 'accessToken': '', 'accessTokenSecret' : ''};
		$http.post(urlTweet,param, {
				headers : { 'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'}
		})
		.success(function(dataReq) { 					  						
						var url=angular.fromJson(dataReq);
						if (url !== 'undefined' && url !== "") {
							/*$window.location.target="blank";
							$window.location.href=url;*/
							var win = window.open(url, '_blank');
							if (win) {
								//Browser has allowed it to be opened
								//misAlertas.muestraAlerta('success',$translate.instant('Sending request to Twitter'));
								win.focus();
								$timeout(function() {
									 setData('TWITTER',img,true);
								},30000);
								deferred.resolve($translate.instant('SENDING_REQUEST'));	
							} else {
								//Browser has blocked it
								//misAlertas.muestraAlerta('danger',"ERROR:Browser have not allowed to be opened a Twitter connection window");
								deferred.reject($translate.instant('BROWSER_DONT_LET'));
							}
						}
						else {
							img.encryptedData[e].twitter[i].tweet=$translate.instant('TWITTER_ERR1');
							misAlertas.muestraAlerta('danger',img.encryptedData[e].twitter[i].tweet);
							deferred.reject(img.encryptedData[e].twitter[i].tweet);
						}
		})
		.error(function(err) {
            //in case of any error we reject the promise with the error object
				//var err=angular.fromJson(err);
				img.encryptedData[e].twitter[i].tweet="ERROR:"+err;
            	misAlertas.muestraAlerta('danger',"ERROR:"+err);
            	deferred.reject(err);
		});
        return deferred.promise; 
    };
    /* FIN TWITTER*/	
	/* PINTEREST */
	$scope.pint = function(image){
		var deferred = $q.defer();
		
		var i=image.encryptedData.length>0 ? image.encryptedData.length-1:0;
		var pint=image.encryptedData[i].pinterest.length>0 ? image.encryptedData[i].pinterest.length-1:0;
		var datos= {
				board: image.encryptedData[i].pinterest[pint].board,
       			note: image.encryptedData[i].pinterest[pint].note,
       			image:image.encryptedData[i].encrypted
        }
		PDK.login({scope: 'read_public,write_public'}, function(response) {
			//if (response.id) {
				var token=PDK.getSession();//['accessToken'];
				var dataURL;
				if (image.encryptedData[i].encrypted === "" && image.encryptedData[i].watermarkImage.done){
					dataURL= image.data;
				}
				else {
					dataURL= image.encryptedData[i].encrypted;
				}
				var blob = dataURItoBlob(dataURL);
				var formData = new FormData();
				//Obtener ID board
				PDK.request('/v1/me/boards/', 'GET', function (boards) {
					var found=false
					for (var r in boards.data) {
						if (boards.data[r].name === datos.board) {
							datos.board=boards.data[r].id;
							found=true;
							break;
						}
					}
					if (!found) {
						//misAlertas.muestraAlerta('danger',$translate.instant('PINT_BOARD_ERROR'));
						image.encryptedData[i].pinterest[pint].post_id=datos.board;
						image.encryptedData[i].pinterest[pint].id="Error: board not found!";
						image.encryptedData[i].pinterest[pint].date=new Date();
						deferred.reject($translate.instant('PINT_BOARD_ERROR'));
						return deferred.promise;;
					}
					formData.append('board', datos.board);
					formData.append('note', image.encryptedData[i].pinterest[pint].note);
					formData.append('image', blob);
					var xhr = new XMLHttpRequest();
					xhr.open( 'post', 'https://api.pinterest.com/v1/pins/?access_token='+token.accessToken+'&fields=id%2Clink%2Cnote%2Curl', true )
					xhr.onload = xhr.onerror = function() {
						var d=JSON.parse(xhr.responseText);
						if (d.message) {
							//misAlertas.muestraAlerta('danger',$translate.instant(d.message));
							image.encryptedData[i].pinterest[pint].post_id=d.board;
							image.encryptedData[i].pinterest[pint].note=d.message;
							image.encryptedData[i].pinterest[pint].date=new Date();
							deferred.reject($translate.instant(d.message));
							return deferred.promise;;
						}										
						image.encryptedData[i].pinterest[pint].post_id=datos.board;
						image.encryptedData[i].pinterest[pint].id=d.data.id;
						image.encryptedData[i].pinterest[pint].url=d.data.url;
						image.encryptedData[i].pinterest[pint].date=new Date();
						deferred.resolve($translate.instant('PINT_PUBLISH'));	
					};
					xhr.send( formData );
				});
		});
		return deferred.promise;
	}
	/* FIN PINTEREST*/
	/* FLICKR*/
	$scope.flickr = function(image){
        var deferred = $q.defer();		
		var i=image.encryptedData.length>0 ? image.encryptedData.length-1:0;
		var flickr=image.encryptedData[i].flickr.length>0 ? image.encryptedData[i].flickr.length-1:0;		
        var urlFlickr="https://"+$scope.server+"/myImage/rest/getDataFlickr.php";
		var dataURL;
		if (image.encryptedData[i].encrypted === "" && image.encryptedData[i].watermarkImage.done){
			dataURL= image.data;
		}
		else {
			dataURL= image.encryptedData[i].encrypted;
		}
		var datos= {
				method: 'upload',
				name:image.name,
				id: image.hash,
				photo:dataURL,
				description: image.encryptedData[i].flickr[flickr].title,
       			title: image.encryptedData[i].flickr[flickr].description,
				tags: image.encryptedData[i].flickr[flickr].tags,       			
				is_public: image.encryptedData[i].flickr[flickr].isPublic,
				is_friend: image.encryptedData[i].flickr[flickr].isFriend,
				is_family: image.encryptedData[i].flickr[flickr].isFamily,
				hidden: image.encryptedData[i].flickr[flickr].isHidden,
        }
		$http.post(urlFlickr,datos, {
				headers : { 'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'}
		})
		.success(function(dataReq) { 					  						
						var url=angular.fromJson(dataReq);
						if (url !== 'undefined' && url !== "") {
							var win = window.open(url, '_blank');
							if (win) {
								//misAlertas.muestraAlerta('success',$translate.instant('Sending request to Flickr'));
								win.focus();
								$timeout(function() {
									setData('FLICKR',image,true);
								},30000);
								deferred.resolve($translate.instant('SENDING_REQUEST'));									
							} else {
								//misAlertas.muestraAlerta('danger',"ERROR:Browser have not allowed to be opened a Flicr conection window");
								deferred.reject($translate.instant('BROWSER_DONT_LET'));
							}
						}
						else {
							image.encryptedData[e].flickr[flickr].description=$translate.instant('AUTHENTICATION');
							//misAlertas.muestraAlerta('danger',image.encryptedData[e].flickr[flickr].description);
							deferred.reject(image.encryptedData[i].flickr[flickr].description);
						}
		})			
		.error(function(err) {
				image.encryptedData[i].flickr[flickr].description="ERROR:"+err;
            	//misAlertas.muestraAlerta('danger',"ERROR:"+err);
            	deferred.reject("ERROR: "+err);
		});
        return deferred.promise; 		
	}
	function setData(rrss,image,again) {
			var data= {
				id: image.hash,
				rrss: rrss
			}
			$http.post("https://"+$scope.server+"/myImage/rest/data.php", data)
			.success(function(dataReq,status) {				
				if (!(status == "204" || angular.isUndefined(dataReq))) {
					var res=angular.fromJson(dataReq);
					var i=image.encryptedData.length>0 ? image.encryptedData.length-1:0;
					if (rrss=='FLICKR') {
						var flickr=image.encryptedData[i].flickr.length>0 ? image.encryptedData[i].flickr.length-1:0;
						image.encryptedData[i].flickr[flickr].id_resp=res.ID_POST;
						image.encryptedData[i].flickr[flickr].date=res.TIME;
					}
					else if (rrss == 'TWITTER') {
						var tweet=(image.encryptedData[i].twitter.length>0 ? image.encryptedData[i].twitter.length-1:0);
						image.encryptedData[i].twitter[tweet].url=res.URL;
						image.encryptedData[i].twitter[tweet].id=res.ID_POST;
						image.encryptedData[i].twitter[tweet].date=res.TIME;
					}
				}
				else {
					//Again
					if (again) {
						//console.log("Código 204. Datos NO recibidos. Reprogramamos");
						$timeout(function() {
									console.log("Programando la alarma: ", image);
									setData(rrss,image,false);
								}, 360000);
					}
					else {
						//console.log("Datos NO recibidos. FIN");
					}
				}
			})
			.error(function(){
				if (again) {
					//console.log("Datos NO recibidos. Reprogramamos");
					$timeout(function() {
									//console.log("Programando la alarma: ", image);
									setData(rrss,image,false);
								}, 360000);
				}
				else {
					//console.log("Datos NO recibidos. FIN");
				}
			});		
	}
	/*** END FLICKR*/	
	$scope.init();
}]);
	
//var ModalInstanceCtrl = 
angular.module('myImageApp').controller('ModalInstanceCtrl',
  ["$scope", "$uibModalInstance", "userForm",'$translate', function ($scope, $uibModalInstance, userForm,$translate) {
    //$scope.form = {};//userForm;
    $scope.submitForm = function (dataImage) {
        if ($scope.form.userForm.$valid) {			
            dataImage.text=$scope.form.userForm.text;
            dataImage.password=$scope.form.userForm.password;
            dataImage.method=$scope.form.userForm.method;
			dataImage.file=$scope.form.userForm.file;
			dataImage.messageWM=$scope.form.userForm.messageWM;
			dataImage.textsize=$scope.form.userForm.textsize;
			dataImage.textcolor=$scope.form.userForm.textcolor; 
			dataImage.gravity=$scope.form.userForm.gravity;
			dataImage.opacity=$scope.form.userForm.opacity;
			dataImage.margin=$scope.form.userForm.margin;

            $uibModalInstance.close('ok');
        } else {
            //console.log('userform is not in scope');
        }
    };
	$scope.submitFormTW = function (dataImage) {
        if ($scope.form.userForm.$valid) {
            dataImage.tweet=$scope.form.userForm.text;
            $uibModalInstance.close('ok');
        } else {
            //console.log('userformTW is not in scope');
        }
    };
	$scope.submitFormFB = function (dataImage) {
        if ($scope.form.userForm.$valid) {
            dataImage.message=$scope.form.userForm.text;
            $uibModalInstance.close('ok');
        } else {
            //console.log('userformFB is not in scope');
        }
    };
	$scope.submitFormPint = function (dataImage) {
        if ($scope.form.userForm.$valid) {
            dataImage.board=$scope.form.userForm.board;
			dataImage.note=$scope.form.userForm.note;
            $uibModalInstance.close('ok');
        } else {
            //console.log('userformPint is not in scope');
        }
    };
	$scope.submitFormFlickr = function (dataImage) {
        if ($scope.form.userForm.$valid) {
			dataImage.description=$scope.userForm.description;
			dataImage.tags=$scope.userForm.tags;
			dataImage.title=$scope.userForm.title;
			dataImage.is_public=$scope.userForm.is_public;
			dataImage.is_friend=$scope.userForm.is_friend;
			dataImage.is_family=$scope.userForm.is_family;
			dataImage.hidden=$scope.userForm.hidden;
            $uibModalInstance.close('ok');
        } else {
            //console.log('userformFlickr is not in scope');
        }
    };
    $scope.cancel = function () {
    	//$uibModalInstance.dismiss('cancel');
    	$uibModalInstance.close('cancel');
    };
    $scope.closeModal = function() {
    	$uibModalInstance.close();
    };
}]);

