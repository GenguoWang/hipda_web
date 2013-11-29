<?php
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
    $db->prepare("insert into log (name,event,time,message) values (?, ? , now(),?)");
    $db->bind_param("sss",$name,$event,$message);
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
