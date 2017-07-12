<?php 
openlog("myImage", LOG_PID | LOG_PERROR, LOG_LOCAL0);
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
	$sqlSyslog="INSERT INTO syslog (IP, RRSS, ACCION, RESULTADO,TIME) VALUES ('$ip','TWITTER', 'CALLBACK', 'MSJ: " . addslashes($msjLog) ."', FROM_UNIXTIME($phpdate))";
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
    $post_date = file_get_contents("php://input");
    $datos = json_decode($post_date);
    $sqlTwitterResult="select ID_POST, URL, TIME from uploadedImages where ID='" .$datos->id ."' and RRSS='".$datos->rrss ."' order by TIME DESC";
    syslog(LOG_INFO, $sqlTwitterResult);    
	$result = $baseDatos->query($sqlTwitterResult);
    $dataToSend=$result->fetch_assoc();
	if(!$dataToSend) {
		header("HTTP/1.0 204 No Response");
        print("");
        //exit();
    }
	else {        
        $sqlDelete="delete from uploadedImages where ID='" .$datos->id ."' and RRSS='".$datos->rrss ."'";
        syslog(LOG_INFO, $sqlDelete);
        $baseDatos->query($sqlDelete);
        //print($sqlDelete);
        print(json_encode($dataToSend));
    }
}
$baseDatos->close();
?>