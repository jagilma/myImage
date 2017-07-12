'use strict';

/**
 * @ngdoc overview
 * @name myImageApp
 * @description
 * # myImageApp
 *
 * Main module of the application.
 */


var app=angular.module('myImageApp', [
    'ngAnimate',
    //'ngCookies',
    //'ngResource',
	//'ngTouch',
    'ngRoute',
    'ngSanitize',
    'LocalStorageModule',
    'base64','ui.bootstrap',
	'dialogs.main','pascalprecht.translate', 
	'ngMaterial','ngProgressLite','checklist-model','smart-table',
	'indexedDB', 'angular-pinterest','ngFileUpload'
  ]);
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/myimageencode.html',
        controller: 'modelCtrl',
        controllerAs: 'model'
      })
      .when('/myImageEncode', {
        templateUrl: 'views/myimageencode.html',
        controller: 'modelCtrl',
        controllerAs: 'model'
      })
      .when('/myImageDecode', {
        templateUrl: 'views/myimagedecode.html',
        controller: 'modelCtrl',
        controllerAs: 'model'
      })
      .when('/history', {
        templateUrl: 'views/checkDataImage.html',
        controller: 'modelCtrl',
        controllerAs: 'history'
      })
	  .when('/import', {
        templateUrl: 'views/import.html',
        controller: 'modelCtrl',
        controllerAs: 'import'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'modelCtrl',
        controllerAs: 'about'
      })
      .when('/contact', {
        templateUrl: 'views/main.html',
        controller: 'modelCtrl',
        controllerAs: 'contact'
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
app.config(function($mdThemingProvider) {
               $mdThemingProvider.theme('docs-dark') 
                  .primaryPalette('blue')
                  .accentPalette('orange')
                  .warnPalette('red')
});
app.config(['$httpProvider', function ($httpProvider) {
	  $httpProvider.defaults.useXDomain = true;
	  delete $httpProvider.defaults.headers.common['X-Requested-With'];	 
}]);

app.constant('toastr', toastr);
app.config(['toastr', function(toastr) {
    // Set options third-party lib
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 3000;
    toastr.options.positionClass = 'toast-bottom-full-width';//'toast-bottom-right';
    toastr.options.preventDuplicates = true;
    toastr.options.progressBar = true;
    toastr.options.closeButton = true;
    toastr.options.newestOnTop = false;
    //mio
    toastr.options.closeDuration = 300;
    toastr.options.closeEasing = 'swing';
  }]);
app.config(['ngProgressLiteProvider', function (ngProgressLiteProvider) {
        ngProgressLiteProvider.settings.speed = 1500;
    }]);  
app.factory('misAlertas', function(){
	return {
		muestraAlerta:function(tipo,texto) {
    		switch(tipo) { 
    			case 'danger': toastr.error(texto);break;
    			case 'warning':toastr.warning(texto);break;
    			case 'info': toastr.info(texto);break;
    			case 'success':toastr.success(texto);break;
    			default: toastr.info(texto);break;
     		}
    		
		},
		cierraAlerta:function(indice){
   	 	toastr.clear();
  	 	}
	}
});
app.config(function ($indexedDBProvider) {
	var myDBName="myImagesDataBase";
	var myStoreName="myImages";
	var myVersion=1;
	/*var trans = $indexedDBProvider.transaction(myDBName, "readwrite");
    var store = trans.objectStore(myStoreName);
    var request = store.delete(id);*/
    $indexedDBProvider
      .connection(myDBName)
      .upgradeDatabase(myVersion, function(event, db, tx){
        var objStore = db.createObjectStore(myStoreName, {keyPath: 'id', autoIncrement: true});
        /*objStore.createIndex('hash', 'hash', {unique: true});
        objStore.createIndex('name', 'name', {unique: false});
		objectStore.transaction.oncomplete = function(event) {
			// Store values in the newly created objectStore.
			var myImagesDataObjectStore = db.transaction("myImagesData", "readwrite").objectStore("myImagesData");
			for (var i in myImagesData) {
				myImagesDataObjectStore.add(myImagesData[i]);
			}
		};*/
     });
});
app.factory('myImages', ['misAlertas', '$translate', /*'$indexedDB','localStorageService',*/
function(misAlertas,$translate/*,$indexedDB,localStorageService*/){
	var myDBName="myImagesDataBase";
	var myStoreName="myImages";	
	//var myImagesDB;//=getDataFromLocalStorage();
	var myImages=getDataFromLocalStorage();
	function getDataFromLocalStorage() {
		//var data;//=localStorageService.get(myDBName) || [];
		/*$indexedDB.openStore(myStoreName, function(store){
			store.getAll().then(function(images) {  
				// Update scope
				myImages = images || [];
			});
		});*/
		myImages = []; // f you want to save in indexedDB, commment this line and uncomment content funtcion .
		return myImages;
	}
	function setDataToLocalStorage() {
		//If you want to save in indexedDB, commment next line and uncomment $indexedDB
		return;
		/*$indexedDB.openStore(myStoreName, function(store){
			store.clear().then(function(){
				$indexedDB.openStore(myStoreName, function(store){
						// multiple items
						//console.log("MYIMAGES A GUARDAR EN INDEXEDDB:", myImages);
						store.upsert(myImages).then(function(e){
						//store.insert(myImages).then(function(e){					
							// do something
							misAlertas.muestraAlerta('success',$translate.instant('OK_INSERT_DB'));
						})
						.catch(function(reason) {
								//console.log('Handle rejected promise ('+reason+') here.');
								misAlertas.muestraAlerta('danger','Handle rejected promise ('+reason+') here.');
						});
				});
			});
		});	*/
		//localStorageService.set(string,myImages);
	}
	function exist(img) {
		if (typeof myImages != "undefined" &&  myImages != null){
	  	 		for (var i in myImages) {
  	 				if (myImages[i].hash === img.hash) {
	  	 				return i;
  		 			}
  	 			}
  	 	}
  	 	return -1;  	
  	}
	/*function existText(img, index) {
		if (typeof myImages != "undefined" &&  myImages != null){
			
  	 	}
		console.log("NO ESTÁ EN:", myImages);
  	 	return undefined;  	
  	}*/
	function addDataImages(arrayData, imagesRRSS,tipo) { 
		// img.encryptedData[j].twitter, img.encryptedData[j].facebook,... es arrayData
		// imagesRRSS es (myImages[index].encryptedData[i].twitter
		var position=arrayData.length>0 ? arrayData-1:0;
		if (arrayData !== undefined) {
			if (arrayData.length>0) {
				if (imagesRRSS.length==0 || arrayData[arrayData.length-1][tipo] !== imagesRRSS[imagesRRSS.length-1][tipo]) {
					imagesRRSS.push(arrayData[position]);										
				}
			}
		}
		//console.log("IMAGES:", imagesRRSS);
		return imagesRRSS;
	}
	function saveDataFormatJSON(){
		var toJSON = '';
		toJSON = angular.toJson(myImages);
		var blob = new Blob([toJSON], { type: "text/json;charset=utf-8"});
		var filename = "myImagesDB.json";
		if (/\bMSIE\b|\bTrident\b/.test(navigator.userAgent)) {
                window.navigator.msSaveOrOpenBlob(blob, filename);
        } 
		else {
                var url  = window.URL || window.webkitURL,
                    link = document.createElementNS("http://www.w3.org/1999/xhtml", "a"),
                    event = document.createEvent("MouseEvents");
                 
                link.href = url.createObjectURL(blob);
                link.download = filename;
 
                event.initEvent("click", true, false);
                link.dispatchEvent(event);
        }
	}
	return {
		addImage:function(img,rrss) {
			var index=exist(img);
			if (index>=0) {
				//console.log("IMG EN ADD:", img);
				//console.log("MYIMAGES: ", myImages);
				for (var j=0; j<img.encryptedData.length;j++) {
					var cambiado=false;
					for (var i=0;i<myImages[index].encryptedData.length;i++) {
						//console.log("Comparando;", myImages[index].encryptedData[i].message,img.encryptedData[j].message);
						if (myImages[index].encryptedData[i].message === img.encryptedData[j].message) {
							switch (rrss) {								
								case 'saved':
									myImages[index].encryptedData[i].saved=addDataImages(img.encryptedData[j].saved, myImages[index].encryptedData[i].saved,'date');
									break;
								case 'twitter':								
									myImages[index].encryptedData[i].twitter=addDataImages(img.encryptedData[j].saved, myImages[index].encryptedData[i].twitter,'url');
									break;
								case 'facebook' :								
									myImages[index].encryptedData[i].facebook=addDataImages(img.encryptedData[j].saved, myImages[index].encryptedData[i].facebook,'id');
									break;								
								case 'pinterest':
									myImages[index].encryptedData[i].pinterest=addDataImages(img.encryptedData[j].saved, myImages[index].encryptedData[i].pinterest,'id');
									break;
								case 'flickr' :
									myImages[index].encryptedData[i].flickr=addDataImages(img.encryptedData[j].saved, myImages[index].encryptedData[i].flickr,'id_resp');							
									break;
								default : //ALL
								    myImages[index].encryptedData[i].push(img.encryptedData[j]);
									break;
							}
							cambiado=true;
							//console.log("myimageBD tras cambo:",index,myImages[index]);
							break;
						}
					}
					/*if (!cambiado) { //el COMENTARIO Añadido el domingo 20
						myImages[index].encryptedData.push(img.encryptedData[j]);
						console.log("myimageBD tras cambo SSS:",index,myImages[index]);
					}*/
				}						
			}
			else {
				myImages.push(img);
			}
			setDataToLocalStorage();
			return myImages;
		},
		deleteImage:function(img) {
			var index=exist(img);
			//console.log("Existe:", index);
			//console.log("Imagen a buscar:", img);
			//console.log("IMágenes:", myImages);
			if (index>=0) {
				/*$indexedDB.openStore(myStoreName, function(store){
					store.delete(myImages[index].hash).then(function(){
						myImages.splice(index,1);
						misAlertas.muestraAlerta('success',$translate.instant('OK_DELETE_DATABASE'));
					});
				});*/
				//console.log("IMagen borrarda");
				myImages.splice(index,1); //If you want to save data, comment this line and uncomment $indexexDB
			}
			return myImages;
		},
		getImages: function () {
			return myImages;
		},
		saveImages:function(){
			setDataToLocalStorage();			
			return myImages;
		},
		deleteAll:function() {
			//localStorageService.clearAll();
			//localStorageService.removeItem(myDBName);
			$indexedDB.openStore(myStoreName, function(store){
				store.clear().then(function(){
					// do something
					myImages=[];
					misAlertas.muestraAlerta('success',$translate.instant('OK_DELETE_DATABASE'));
				});
			});			
			return myImages;
		},
		loadImages:function(){
			myImages=getDataFromLocalStorage(myDBName);
			return myImages;
		},
		exportMyImages:function() {
			//console.log(myImages);
			return saveDataFormatJSON();
		},
		importMyImages:function(tableData) {
			myImages=angular.copy(tableData);
			return myImages;
		}
	}
}]);
app.factory("myConfig", ['localStorageService', function(localStorageService) {
	var myString="myImage-SetUP";
	var imagesSetUP=getDataFromLocalStorage();
    var watermarkImage={ name:"", opacity:0.7, margin:12, gravity: "south", message: "" };
	function getDataFromLocalStorage() {
		var data=localStorageService.get(myString) || {message:'',password:'',method:'', 
			watermarkImage: { name:'', opacity:0, margin:0, gravity: '', message: '' }
		};
		return data;
	}
	function setDataToLocalStorage(string) {
		localStorageService.set(string,imagesSetUP);
	}
	return {
		initSetUP: function () {
			imagesSetUP=getDataFromLocalStorage();
			return imagesSetUP;
		},
		getConfig: function () {			
			return imagesSetUP;
		},
		setConfig: function (newConfig) {
			imagesSetUP=angular.copy(newConfig);
			//console.log("cambiando image set up", newConfig);
			setDataToLocalStorage(myString);
			return imagesSetUP;
		},
		addMessage: function (msg) {
			imagesSetUP.message=msg;
			setDataToLocalStorage(myString);
			return imagesSetUP;
		},
		addPassword: function (pass) {
			imagesSetUP.password=pass;
			setDataToLocalStorage(myString);
			return imagesSetUP;
		},
		addMethod: function (method) {
			imagesSetUP.method=method;
			setDataToLocalStorage(myString);
			return imagesSetUP;
		},
		addWatermarkImage: function (water) {
			imagesSetUP.watermarlImage=angular.copy(water);
			setDataToLocalStorage(myString);
			return imagesSetUP;
		}
	};
}]);
app.config(['dialogsProvider','$translateProvider',function(dialogsProvider,$translateProvider){
		dialogsProvider.useBackdrop('static');
		dialogsProvider.useEscClose(false);
		dialogsProvider.useCopy(false);
		dialogsProvider.setSize('sm');

		var translationsES={
			OR: "O",
			DIALOGS_ERROR: "Error",
			DIALOGS_ERROR_MSG: "Se ha producido un error desconocido.",
			DIALOGS_CLOSE: "Cierra",
			DIALOGS_PLEASE_WAIT: "Espere por favor",
			DIALOGS_PLEASE_WAIT_ELIPS: "Espere por favor...",
			DIALOGS_PLEASE_WAIT_MSG: "Esperando en la operaci\u00f3n para completar.",
			DIALOGS_PERCENT_COMPLETE: "% Completado",
			DIALOGS_NOTIFICATION: "Notificaci\u00f3n",
			DIALOGS_NOTIFICATION_MSG: "Notificaci\u00f3n de aplicaci\u00f3n Desconocida.",
			DIALOGS_CONFIRMATION: "Confirmaci\u00f3n",
			DIALOGS_CONFIRMATION_MSG: "Se requiere confirmaci\u00f3n.",
			DIALOGS_OK: "Bueno",
			DIALOGS_YES: "Si",
			DIALOGS_NO: "No", // A partir de aquí
			MODALFORM_MSG: "\u00A1Configura tu App!",
			MODALFORM_OP1: "Texto",
			MODALFORM_OP2: "Clave", //"Contrase\u00F1a",
			MODALFORM_OP3: "Funci\u00f3n criptogr\u00e1fica",
			MODALFORM_OP3_SELECT: "Selecciona un m\u00e9todo",
			MODALFORM_OP4:"Imagen marca",
			MODALFORM_FLICKR_MSG:"Configuraci\u00f3n de Flickr",
			MODALFORM_FLICKR_OP1:"T\u00adtulo",
			MODALFORM_FLICKR_OP2:"Descripci\u00f3n",
			MODALFORM_FLICKR_OP3:"Etiquetas",
			MODALFORM_FLICKR_OP4:"Flags",
			MODALFORM_FLICKR_OP5:"\u00bfEs p\u00bablico?",
			MODALFORM_FLICKR_OP6:"\u00bfSolo amigos?",
			MODALFORM_FLICKR_OP7:"\u00bfSolo familia?",
			MODALFORM_PINT_MSG:"Configuraci\u00f3n de Pinterest",
			MODALFORM_PINT_OP1:"Tablero",
			MODALFORM_PINT_OP2:"Pin",
			WATERMARK_OPACITY: "Opacidad",
			WATERMARK_MARGIN: "Margen",
			WATERMARK_GRAVITY: "Posici\u00f3n",
			WATERMARK_MESSAGE: "Texto para marca de agua",
			WATERMARK_TEXTCOLOR:"Color texto"		,
			WATERMARK_TEXTSIZE:"Tama\u00F1o letra",
			ALREADY_MARKED_MSG: 'La imagen ya est\u00e1 marcada',
			SELECT_IMAGE: "Recuerda: selecciona la imagen. Si quieres chequear im\u00e1genes marcadas, configura la antes.",
			TEXT_IMAGE: "La imagen ya tiene texto incrustado",
			FIRST_IMAGE: "Debe indicar primero un texto para marcar la imagen",
			SIGN_IMAGE: "Debe insertarse primero un mensaje en la imagen",
			CHECK_IMAGE: "No se ha configurado la clave y m\u00e9todo de cifrado para comprobar si el fichero ya est\u00e1 marcado con texto cifrado",
			DONT_MATCH_TEXT_IMAGE: "La imagen tiene un texto embebido y es diferente del que se ha seleccionado para marcarla",
			DONT_ENCRYPTED_IMAGE: "La imagen no est\u00e1 marcada",
			NO_ENCRYP_METHOD_MSG: "No hay m\u00e9todo de cifrado",
			NO_PASSWORD: "No hay contrase\u00F1a. Se guardar\u00e1 texto sin cifrar",
			NAME_TABLE: "Nombre",
			PREVIEW_TABLE: "Vista previa",
			ACTIONS_TABLE: "Acciones",
			ENCODE:'Codificar',
			ENCODE_H:'Proceso de codificaci\u00f3n',
			ENCODE_TYPE1: 'Estego',
			ENCODE_TYPE2: 'Marca de agua',
			DECODE:'Decodificar',
			DECODE_H:'Proceso de decodificaci\u00f3n',			
			MESSAGE_TABLE_DECODE: "Texto escrito en imagen",
			MESSAGE_TABLE_ENCODE: "Texto a escribir en imagen",
			CANT_DECODE:"No se ha podido decodificar. Contrase\u00F1a o m\u00e9todo err\u00f3nea",
			DB_BUTTON: "Guardar Datos",
			UP_BUTTON: "Carga imagen",
			OK_INSERT_DB: "Dato guardado en base de datos local",
			OK_DELETE_DATABASE: "Base de datos local borrada",
			FIRST_STEP: "A\u00F1ade imagen",
			SIGN_BUTTON: "Marcar",
			CHECK_BUTTON: 'Comprobar',
			SAVE_BUTTON: "Guardar",
			DELETE_BUTTON: "Borrar",
			DELETE_TOOLTIP: "Borrar",
			SETUP_BUTTON: "Configurar",
			NEXT_BUTTON: "Siguiente",
			OK_BUTTON: "Ok",
			CANCEL_BUTTON: "Cancelar",
			CLOSE_BUTTON: "Cerrar",
			FB_BUTTON:"Facebook",
			TWITTER_BUTTON:"Twitter",
			CONTACT:"Contacto",
			ABOUT:"Acerca de",
			HOME:"Inicio",
			ADVICE_SAVEDATA:"No hay datos para guardar. Primero debe firmar y salvar la imagen firmado",
			SUCCESS_SAVEDATA:"Hist\u00f3rico de nombre de ficheros, textos, contraseña y algortimos de cifrado utilizado guardados en el almacenamiento local de este navegador",
			HISTORY: "Hist\u00f3rico",
			SAVE_HISTORY: "Salvar hist\u00f3rico",
			METHOD_TEXT: 'M\u00e9todo',
			SEARCHING_FILE: 'Buscando',
			ABOUT_TEXT: 'Sígueme en Twitter @jagilma',
			LICENSE_TEXT:'LICENCIA GPL v3 (https://www.gnu.org/licenses/gpl-3.0.html)',
			NOTE_TEXT: 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',		
			ERROR_FORM_IMG: 'Error salvando datos del formulario. Si persiste, contacte con el administrador',
			SELECT_ALL: 'Todas',
			DESELECT_ALL: 'Ninguna',
			CHECKALL_MSG: "Se va a proceder a chequear todas las im\u00e1genes seleccionadas con la configuraci\u00f3n indicada para cada una. \u00BFDesea continuar?",
			SIGNALL_MSG: 'Se va a proceder a firmar todas las im\u00e1genes seleccionadas con la configuraci\u00f3n indicada para cada una.  \u00BFDesea continuar?',
			MARKALL_MSG: 'Tienes configurado para realizar tanto la marca de agua como grabar informaci\u00f3n con estegograf\u00ada. \u00BFDesea realizar ambas?',
			WATERMARKING_MSG: 'Marcando la imagen',
			WATERMARK_MSG: 'Tienes marca de agua configurada, \u00BFQuieres hacer esa marca en la imagen?',
			NOWATERMARK_MSG: 'No hay configuraci\u00f3n para marca de agua. No se realizar\u00e1',
			STEGO_MSG: 'Tienes configurado la informaci\u00f3n de estegograf\u00ada. \u00BFQuieres aplicarla a la imagen?',
			SIGNALL_TOOLTIP: 'Para marcar todas las im\u00e1genes seleccionadas',
			DELETEALL_TOOLTIP: 'Para borrar todas las im\u00e1genes seleccionadas',
			CHECKALL_TOOLTIP:'Para comprobar si todas las im\u00e1genes seleccionadas están marcadas',
			SELECTALL_TOOLTIP:'Selecciona todas las im\u00e1genes cargadas ',
			DELETEALL_MSG: 'Todas las im\u00e1genes seleccionadas ser\u00e1n borradas.\u00BFDesea continuar?',
			IMAGE_DELETED: 'Imagen borrada',
			SAVEALL_TOOLTIP: 'Guardar en disco local todas las im\u00e1genes seleccionadas',
			SAVED_TOOLTIP: 'Guardado en el disco local', 
			SAVE_TOOLTIP: 'Descarga en el disco local',
			ADVICE_MSG: 'Esta configuraci\u00f3n afectar\u00e1 a todas las im\u00e1genes que no tengan una propia',
			TWITTER_TOOLTIP: 'Publica tuit con esta imagen',
			FACEBOOK_TOOLTIP: 'Escribir un post en Facebook con esta imagen',
			TWEET_TOOLTIP: 'Publicado en twitter',
			MODALFORM_TW_MSG: 'Escribe el texto de tu tuit (140 m\u00e1ximo)',
			MODALFORM_FB_MSG: 'Escribe el texto de tu post',
			TWEET_PUBLISH:'Tuit publicado correctamente',
			FB_POST_PUBLISH:'Post publicado!!!',
			FB_POST_NOT_PUBLISH: 'ERROR!!! Post No publicado',
			PINT_BOARD_ERROR:'Pint no publicado. Problemas con el tablero',
			PINT_PUBLISH:'Pint publicado',
			PUBLISH_DATA:'Publicaciones',
			EXPORT_TOOLTIP: 'Exportar base de datos',
			IMPORT_TOOLTIP: 'Importar datos',
			INFO_TOOLTIP: 'M\u00e1s informaci\u00f3n sobre la imagen',
			START_UPLOADING: 'Importaci\u00f3n INICIADA',
			END_UPLOADING: 'Importaci\u00f3n finalizada. Elige las im\u00e1genes a cargar',
			DONT_SELECTED_IMAGE_TO_UP: 'No hay im\u00e1genes seleccionadas para cargar',
			LOCKED: 'Texto crifrado escrito en la imagen',
			UNLOCKED: 'Texto no cifrado escrito en la imagen',
			IMGUPLOADED: 'Imagen subida',
			IMG_UP:'Selecciona imagen',
			DONT_GET_IMAGE_URL: 'No se ha podido obtener la imagen. Si no hay problemas de conectividad, la opci\u00f3n m\u00e1s probable es que no se permita por la protecci\u00f3n contra CORS. Si no puedes hablitar las cabeceras apropiadas, desc\u00e1rgate la imagen y usa la opci\u00f3n de cargar imagen',
			IMAGE_SO_BIG: 'Compríme esta imagen antes de marcar, por ejemplo, con https://compressor.io. Es demasiado grande para publicar en algunas de las redes sociales permitidas',
			NO_FILES_1: 'Problema en la carga del fichero',
			NO_FILES_2: 'Fichero vac\u00ado',
			BROWSER_DONT_LET: 'ERROR:El navegador no permite abrir una ventana',
			TWITTER_ERR1: 'ERROR: pidiendo autorizaci\u00f3n a Twitter',
			AUTHENTICATION:' ERROR: No se ha autenticado correctamente',
			SENDING_REQUEST: 'Enviando petici\u00f3n'

		};
		var translationsEN={
			OR: "OR",
			DIALOGS_ERROR: "Error",
			DIALOGS_ERROR_MSG: "Unknown error",
			DIALOGS_CLOSE: "Close",
			DIALOGS_PLEASE_WAIT: "Please, wait a minute",
			DIALOGS_PLEASE_WAIT_ELIPS: "Please, wait...",
			DIALOGS_PLEASE_WAIT_MSG: "Please, wait for next step",
			DIALOGS_PERCENT_COMPLETE: "% Completed",
			DIALOGS_NOTIFICATION: "Notification",
			DIALOGS_NOTIFICATION_MSG: "Unknown notification",
			DIALOGS_CONFIRMATION: "Confirmation",
			DIALOGS_CONFIRMATION_MSG: "Confirmation is required.",
			DIALOGS_OK: "All right!",
			DIALOGS_YES: "Yes!",
			DIALOGS_NO: "Nope!", 
			MODALFORM_MSG: "Set up your App!",
			MODALFORM_OP1: "Text",
			MODALFORM_OP2: "Key",
			MODALFORM_OP3: "Cryptographic Function",
			MODALFORM_OP3_SELECT: "Select a method",
			MODALFORM_OP4:"Image to watermark",
			MODALFORM_FLICKR_MSG:"Flickr Setup",
			MODALFORM_FLICKR_OP1:"Title",
			MODALFORM_FLICKR_OP2:"Description",
			MODALFORM_FLICKR_OP3:"Tags",
			MODALFORM_FLICKR_OP4:"Flags",			
			MODALFORM_FLICKR_OP5:"Is Public?",
			MODALFORM_FLICKR_OP6:"Is friends?",
			MODALFORM_FLICKR_OP7:"Is family?",
			MODALFORM_PINT_MSG:"Setup Pinterest",
			MODALFORM_PINT_OP1:"Boards",
			MODALFORM_PINT_OP2:"Pin",
			WATERMARK_OPACITY: "Opacity",
			WATERMARK_MARGIN: "Margin",
			WATERMARK_GRAVITY: "Gravity",
			WATERMARK_MESSAGE: "Text to watermark",	
			WATERMARK_TEXTCOLOR:"Text color"		,
			WATERMARK_TEXTSIZE:"Text size",
			ALREADY_MARKED_MSG:'The image is marked already',
			SELECT_IMAGE: "Remember: You have to select the image. Setup before if you want to check marked image",
			TEXT_IMAGE: "The image has embedded text already",
			FIRST_IMAGE: "You must first write a text to mark the image",
			SIGN_IMAGE: "You must first write a message into the image",
			CHECK_IMAGE: "You need to setup cipher key and cipher method to check if the image has a written ciphered text",
			DONT_MATCH_TEXT_IMAGE: "The image has embedded text already and it is different from that selected to mark",
			DONT_ENCRYPTED_IMAGE: "The image is not marked",
			NO_ENCRYP_METHOD_MSG: "There is not a encrypt method",
			NO_PASSWORD: "No passoword, then it will write no encrypted text",
			NAME_TABLE: "Name",
			PREVIEW_TABLE: "Preview",
			ACTIONS_TABLE: "Actions",
			ENCODE:'Encode',
			ENCODE_H:'Encode process',
			ENCODE_TYPE1: 'Stego',
			ENCODE_TYPE2: 'Watermark',
			DECODE:'Decode',
			DECODE_H:'Decode process',
			MESSAGE_TABLE_DECODE: "Message in the image",
			MESSAGE_TABLE_ENCODE: "Message to the image",
			CANT_DECODE:"It can not decode the image. It is possible you are a wrong password or method",
			DB_BUTTON: "Save Data",
			UP_BUTTON: "Get image",
			OK_INSERT_DB: "Saved data into local data base",
			OK_DELETE_DATABASE: "Local data base deleted",
			FIRST_STEP:"Add image",
			SIGN_BUTTON: "Sign",
			CHECK_BUTTON: 'Check',
			SAVE_BUTTON: "Save",
			DELETE_BUTTON: "Delete",
			DELETE_TOOLTIP: "Delete image",
			SETUP_BUTTON: "Setup",
			NEXT_BUTTON: "Next",
			OK_BUTTON: "Ok",
			CANCEL_BUTTON: "Cancel",
			CLOSE_BUTTON: "Close",
			FB_BUTTON:"Facebook",
			TWITTER_BUTTON:"Twitter",
			CONTACT:"Contact",
			ABOUT:"About",
			HOME:"Home",
			ADVICE_SAVEDATA:"No data to save. First you must sign and save the marked image",
			SUCCESS_SAVEDATA:"File name, text, password and encryption algorithms used have been stored in the browser local storage",
			HISTORY: "History",
			SAVE_HISTORY: "Save history",
			METHOD_TEXT: 'Method',
			SEARCHING_FILE: 'Searching',
			ABOUT_TEXT: 'Follow me on:',
			LICENSE_TEXT:'LICENSE GPL v3 (https://www.gnu.org/licenses/gpl-3.0.html)',
			NOTE_TEXT: ' THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
			ERROR_FORM_IMG: 'Error with the form. Contact with the programmer',
			SELECT_ALL: 'Select all',
			DESELECT_ALL: 'Deselect all',
			CHECKALL_MSG: 'All selected images will be checked. Do you want to continue?',
			SIGNALL_MSG: 'All selected images will be signed. Do you want to continue?',
			MARKALL_MSG: 'Do you want to watermark and to write stego information?',
			WATERMARK_MSG: 'You have a watermarck set. Do you want to watermark the image?',
			NOWATERMARK_MSG: 'There is not watermark setup. It do not',
			STEGO_MSG: 'You have a stego set. Do you want to write into the image?',
			WATERMARKING_MSG: 'Marking image',
			SIGNALL_TOOLTIP: 'To sign all selected images',
			DELETEALL_TOOLTIP: 'To delete all selected images',
			CHECKALL_TOOLTIP: 'To check all selected images',
			SELECTALL_TOOLTIP:'To select all uploaded images',
			SAVEALL_TOOLTIP: 'To save all selected images',
			SAVED_TOOLTIP: 'Saved on local disk',
			SAVE_TOOLTIP: 'Download to local disk',
			DELETEALL_MSG: 'All selected images will be deleted. Do you want to continue?',
			IMAGE_DELETED: 'Image deleted',
			ADVICE_MSG: 'This configuration will be applied to all images that do not have their own one',
			TWITTER_TOOLTIP: 'Send a tweet with this image',
			FACEBOOK_TOOLTIP: 'Send a facebook post with this image',
			TWEET_TOOLTIP: 'Published on twitter',
			MODALFORM_TW_MSG: 'Write your tweet text!',
			MODALFORM_FB_MSG: 'Write your post text!',
			TWEET_PUBLISH:'Tweet published!!!',
			FB_POST_PUBLISH:'Post published!!!',
			FB_POST_NOT_PUBLISH: 'ERROR!!! Post NOT Published',
			PINT_BOARD_ERROR:'ERROR!!! Pint not published due to board error.',
			PINT_PUBLISH:'Pint uploaded',
			PUBLISH_DATA:'Publishing',
			EXPORT_TOOLTIP: 'To export data base',
			IMPORT_TOOLTIP: 'To import data base',
			INFO_TOOLTIP: 'More information about the image',
			START_UPLOADING: 'Starting images upload',
			END_UPLOADING: 'Uploading ended. Choose images to upload',
			DONT_SELECTED_IMAGE_TO_UP: 'You do not select any image to upload',
			LOCKED: 'Ciphered text wrote in the image',
			UNLOCKED: 'No ciphered text wrote in the image',
			IMGUPLOADED: 'Uploaded image',
			IMG_UP:'Choose image',
			DONT_GET_IMAGE_URL: 'It could not get the picture. If there are no connectivity problems, it is probably not allowed by CORS protection.If you can not enable correct headers, download the image, then use upload image option.',
			IMAGE_SO_BIG: 'A good idea is to compress before to mark (https://compressor.io). This image is too large to publish on some of the allowed social networks',
			NO_FILES_1: 'Unknown problem uploading the file',
			NO_FILES_2: 'The file is empty',
			BROWSER_DONT_LET: 'ERROR: Browser have not allowed to be opened a window',
			TWITTER_ERR1: 'ERROR Twitter authenticating ',
			AUTHENTICATION:' ERROR: unsuccessful authentication',
			SENDING_REQUEST: 'Sending request'			
		};

		$translateProvider.translations('en', translationsEN);
  		$translateProvider.translations('es', translationsES);
  		$translateProvider.uniformLanguageTag('bcp47').determinePreferredLanguage(); 
		//$translateProvider.preferredLanguage('en');
  		$translateProvider.fallbackLanguage('en');
  		$translateProvider.useSanitizeValueStrategy('sanitizeParameters');
}]);

app.run(['$templateCache',function($templateCache){
  		$templateCache.put('/dialogs/custom.html','<div class="modal-header"><h4 class="modal-title"><span class="glyphicon glyphicon-star"></span> User\'s Name</h4></div><div class="modal-body"><ng-form name="nameDialog" novalidate role="form"><div class="form-group input-group-lg" ng-class="{true: \'has-error\'}[nameDialog.username.$dirty && nameDialog.username.$invalid]"><label class="control-label" for="course">Name:</label><input type="text" class="form-control" name="username" id="username" ng-model="user.name" ng-keyup="hitEnter($event)" required><span class="help-block">Enter your full name, first &amp; last.</span></div></ng-form></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button><button type="button" class="btn btn-primary" ng-click="save()" ng-disabled="(nameDialog.$dirty && nameDialog.$invalid) || nameDialog.$pristine">Save</button></div>');
  		$templateCache.put('/dialogs/custom2.html','<div class="modal-header"><h4 class="modal-title"><span class="glyphicon glyphicon-star"></span> Custom Dialog 2</h4></div><div class="modal-body"><label class="control-label" for="customValue">Custom Value:</label><input type="text" class="form-control" id="customValue" ng-model="data.val" ng-keyup="hitEnter($event)"><span class="help-block">Using "dialogsProvider.useCopy(false)" in your applications config function will allow data passed to a custom dialog to retain its two-way binding with the scope of the calling controller.</span></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="done()">Done</button></div>')
  		$templateCache.put('/dialogs/message.html','<div class="modal-header"><h4 class="modal-title"><span class="glyphicon glyphicon-star"></span> Custom Dialog 2</h4></div><div class="modal-body"><label class="control-label" for="customValue">Custom Value:</label><input type="text" class="form-control" id="customValue" ng-model="data.val" ng-keyup="hitEnter($event)"><span class="help-block">Using "dialogsProvider.useCopy(false)" in your applications config function will allow data passed to a custom dialog to retain its two-way binding with the scope of the calling controller.</span></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="done()">Done</button></div>')
}]); 

 

