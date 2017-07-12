<?php
session_id("myImage");session_start();
require __DIR__ . '/../twitteroauth-master/autoload.php';

use Abraham\TwitterOAuth\TwitterOAuth;
$post_date = file_get_contents("php://input");
$datos = json_decode($post_date);
//$media = "@{$datos->media};type=image/png;filename={$datos->name}";
openlog("inscripcionCursosEISANE", LOG_PID | LOG_PERROR, LOG_LOCAL0);
function enviarCorreo($msj,$to,$from,$bd=null) {
	$ip = $_SERVER['REMOTE_ADDR']; // Get the IP from superglobal
        $host = gethostbyaddr($ip);    // Try to locate the host of the attack
        $date = date("Y-m-d");
        
        // create a logging message with php heredoc syntax
        $logging = "<< Inicio mensaje de error de publicación en Flickr Mundo Errante>>\r\n";
        $logging .= "\r\nInformacion: {$msj}\r\n IP-Adress: {$ip} \r\n Host: {$host} \r\n";
        $logging .= "<< Fin del mensaje >>";
        $subject = 'Notificación Publicación Flickr';
         $header = 'From: ' .$from .' \r\n X-Mailer: PHP/' . phpversion();
         $resEnvio=mail($to, $subject, $logging, $header);
         if ($resEnvio) {
                    $msj .= " -- Enviado";
         }
         else {
             $msj .= " -- Fallo al enviar";
         }
         if($bd) {
            $mysqldate = date( 'Y-m-d H:i:s');
            $phpdate = strtotime( $mysqldate ); 
         	$sql="INSERT INTO syslog (IP, RRSS, ACCION, RESULTADO,TIME) VALUES ('$ip','TWITTER', 'MSJ:  " .addslashes($msj) ."' ENVIADO POR CORREO A $to','$resEnvio', FROM_UNIXTIME($phpdate))";
				$resultado = $bd->query($sql);
				//NO comprobamos para que no sea la historia interminable
         }
}
function registraEvento($bd,$msjLog,$datosConfig,$enviaCorreo=false) {
	//echo "<div class='alert alert-danger' id='errores'>" .$msjLog ." </div>";
	syslog(LOG_ERR, $msjLog);
	$ip=$_SERVER['REMOTE_ADDR'];
         $mysqldate = date( 'Y-m-d H:i:s');
        $phpdate = strtotime( $mysqldate ); 
	$sqlSyslog="INSERT INTO syslog (IP, RRSS, ACCION, RESULTADO,TIME) VALUES ('$ip','TWITTER', 'OAUTH', 'MSJ: " . addslashes($msjLog) ."',FROM_UNIXTIME($phpdate))";
	$rSyslog = $bd->query($sqlSyslog);
	if(!$rSyslog) {
		syslog(LOG_ERR, "NO REGISTRA LOG:" . $sqlSyslog);
	}
	if($enviaCorreo) {
		enviarCorreo($msjLog,$datosConfig['to'], $datosConfig['from'],$bd);
	}
	return $msjLog;
}
$datosConfig = parse_ini_file("../configuracion/config.ini");
$baseDatos = new mysqli($datosConfig['servidor'], $datosConfig['usuario'], $datosConfig['pass'], $datosConfig['bd']);
if(mysqli_connect_errno()) {
					$msjLog="ERROR CONEXION BD: '" .mysqli_connect_error() ."'";					
					enviarCorreo($msjLog,$datosConfig['to'], $datosConfig['from']);
                    header('HTTP/1.1 500 Internal Server Error');
                    print ("Server error!!!");
					exit();									
}
else {
    $_SESSION['status']=$datos->status;    
    $_SESSION['id']=$datos->id;
    /*$size=getimagesizefromstring($datos->media);
    $bits=$size[0]*$size[1]*$size['bits'];
    if ($bits<3000000) {
         syslog(LOG_ERR, 'This image is too big:'.$bits);
         registraEvento($baseDatos, "This image is too big",$datosConfig);
            header('HTTP/1.1 409 - Conflict This image is too big');
            print ("This image is too big!!!-->".$bits);
            exit();
    }*/
    $bits=strlen(base64_decode($datos->media));
    if ($bits>3000000) {
        syslog(LOG_ERR, 'This image is too big:'.$bits);
         registraEvento($baseDatos, "This image is too big:".$bits,$datosConfig);
            header('HTTP/1.1 409 - Conflict This image is too big');
            print ("This image is too big!!!-->".$bits);
            exit();
    }
    $_SESSION['media']=$datos->media;
    syslog(LOG_INFO, 'Paso 1:'.$datos->status);
    syslog(LOG_INFO, 'Paso 2:'.$datos->name);
    //syslog(LOG_INFO, 'Paso 3:'.$media);
    $apiKey = $datosConfig['apiKeyTwitter'];
    $secret = $datosConfig['secretTwitter'];

    $connection = new TwitterOAuth($apiKey, $secret);//, $access_token, $access_token_secret);
    $request_token = $connection->oauth('oauth/request_token');//, ['oauth_callback' => OAUTH_CALLBACK]);
    syslog(LOG_INFO, "Tras request token:" .$request_token['oauth_token']);
    registraEvento($baseDatos, "request token obtenido ",$datosConfig);        
    switch ($connection->getLastHttpCode()) {
        case 200:
            /* Save temporary credentials to session. */
            if ($request_token['oauth_token'] == "") {
                syslog(LOG_INFO, "oauth_token esta vacio");
                registraEvento($baseDatos, "Oauth Token vacio!!! ",$datosConfig);
                header('HTTP/1.1 500 Internal Server Error');
                print ("Server error!!!");        
                exit("TOken no recibido");
            }
            $_SESSION['oauth_token'] = $request_token['oauth_token'];
            $_SESSION['oauth_token_secret'] = $request_token['oauth_token_secret'];
            registraEvento($baseDatos, "Oauth Token Obtenido",$datosConfig);
            /* Build authorize URL and redirect user to Twitter. */
            $url = $connection->url('oauth/authorize', ['oauth_token' => $request_token['oauth_token']]);
            break;
        default:
            /* Show notification if something went wrong. */
            syslog(LOG_ERR, 'Could not connect to Twitter. Refresh the page or try again later.');
            print "ERROR";
            header('HTTP/1.1 500 Internal Server Error');
            print ("Server error!!!");
            exit();
            //$url="";
    }
    syslog(LOG_INFO, "Tras oauth/authorize:" .$url);
    registraEvento($baseDatos, "Autorización y URL:" .$url, $datosConfig);
    //header("Location: ".$url);
    print json_encode($url);
}