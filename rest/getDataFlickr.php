 <?php
 session_id("myImage");session_start();
 //Leer config.ini y registrar petición
openlog("myImageSYSLOG", LOG_PID | LOG_PERROR, LOG_LOCAL0);
//ini_set("include_path", '/home/wirdpybg/php:' . ini_get("include_path")  );
//ini_set("include_path", '/var/www/html/myImage:' . ini_get("include_path")  );
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
         	$sql="INSERT INTO syslog (IP, RRSS, ACCION, RESULTADO,TIME) VALUES ('$ip','FLICKR', 'MSJ:  " .addslashes($msj) ."' ENVIADO POR CORREO A $to','$resEnvio', FROM_UNIXTIME($phpdate))";
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
	$sqlSyslog="INSERT INTO syslog (IP, RRSS, ACCION, RESULTADO,TIME) VALUES ('$ip','FLICKR', 'GUARDANDO DATOS FLICKR','MSJ: " . addslashes($msjLog) ."', FROM_UNIXTIME($phpdate))";
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
                    print ("Image have not saved at server!!!");
					exit();									
}
else {
    //Comprobar restricciones: tamaño, escritura y lectura en el directorio upload
    syslog(LOG_ERR, "HA LELGSO");
    $post_date = file_get_contents("php://input");        
    $datos = json_decode($post_date);
    $filename=$baseDatos->real_escape_string($datos->name);
    //syslog(LOG_ERR, $datos);
    $data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $datos->photo));
    $date = new DateTime();    
	$unique=$date->getTimestamp();
    if (mkdir('./'.$unique)) {
        $name='./'.$unique ."/" . $filename;
        registraEvento($baseDatos, "Creado directorio y fichero temporal " .$name,$datosConfig); 
        if (file_put_contents($name, $data)) {
            $_SESSION['image']=$name;//$_POST['datos'];//$post_date;//json_encode($datos);
            $_SESSION['dir']="./".$unique;
            $_SESSION['id']=$datos->id;
            $_SESSION['description']=$datos->description;
            $_SESSION['title']=$datos->title;
            $_SESSION['tags']=$datos->tags;
            /*$_SESSION['is_public']=$datos->is_public;
            $_SESSION['is_friend']=$datos->is_friend;
            $_SESSION['is_family']=$datos->is_family;        */
            registraEvento($baseDatos, "Imagen " .$filename ." guardada en ". $name . " para enviar a flickr",$datosConfig);
            //print json_encode('https://mundoerrante.net/myImage/rest/callbackFlickr-oauth.php');
            print json_encode('http://localhost/myImage/rest/callbackFlickr-oauth.php');
        }
        else {
            registraEvento($baseDatos, "NO está guardada la imagen. Algún problema con BANA " .$name,$datosConfig); 
            header('HTTP/1.1 500 Internal Server Error');
            print ("Image have not saved at server!!!");
        }
    }else {
        registraEvento($baseDatos, "NO se ha podido crear el directorio /tmp/" .$unique,$datosConfig); 
            header('HTTP/1.1 500 Internal Server Error');
            print ("Image have not saved at server!!!");
    }

}
?>