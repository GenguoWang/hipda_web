<?php
    if(!empty($_SERVER["HTTP_CLIENT_IP"])){
      $cip = $_SERVER["HTTP_CLIENT_IP"];
    }
    elseif(!empty($_SERVER["HTTP_X_FORWARDED_FOR"])){
      $cip = $_SERVER["HTTP_X_FORWARDED_FOR"];
    }
    elseif(!empty($_SERVER["REMOTE_ADDR"])){
      $cip = $_SERVER["REMOTE_ADDR"];
    }
    else{
      $cip = "unknown";
    }
    if(!empty($_SERVER["HTTP_USER_AGENT"])){
        $cag = $_SERVER["HTTP_USER_AGENT"];
    }
    else{
        $cag = "unknown";
    }
    if(isset($_POST["ip"]))$cip= $_POST["ip"];
    if(isset($_POST["agent"]))$cag= $_POST["agent"];
    require_once("db.php");
    $db = new DB();
    if(isset($_POST["name"]))$name= $_POST["name"];
    else{
        die(json_encode(array("error_msg"=>"no name")));
    }
    $event = $_POST["event"];
    if(isset($_POST["event"]))$event= $_POST["event"];
    else{
        die(json_encode(array("error_msg"=>"no event")));
    }
    if(isset($_POST["message"]))$message = $_POST["message"];
    else $_POST["message"] = "";
    $db->prepare("insert into log (name,event,time,message,ip,agent) values (?, ? , now(),?,?,?)");
    $name = iconv('GBK','UTF-8//IGNORE',$name);
    $message = iconv('GBK','UTF-8//IGNORE',$message);
    $db->bind_param("sssss",$name,$event,$message,$cip,$cag);
    $res = $db->insert();
    if($res)
    {
        echo json_encode(array("handle"=>"success"));
    }
    else
    {
        echo json_encode(array("handle"=>"error","error_msg"=>"insert db failed"));
    }
?>
