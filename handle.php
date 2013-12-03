<?php
require_once("config.php");
require_once("db.php");
$db = new DB();
$db->prepare("select * from task");
$tasks = $db->listArray(); 
$userDict = array();
foreach($tasks as $task){
    $config = json_decode($task["config"],true);
    if(!isset($userDict[$task["name"]])){
        $ch = curl_init();  
        if(isset($config["cookieName"])){
            curl_setopt($ch, CURLOPT_COOKIEJAR, $config["cookieName"]);  
            curl_setopt($ch, CURLOPT_COOKIEFILE, $config["cookieName"]); 
        }
        else{
            $header[]= 'Cookie: '.$config["cookiestr"];
            $header[]= 'User-Agent: '.$config["agent"]; 
            curl_setopt($ch,CURLOPT_HTTPHEADER,$header);   
        }
        $url = $gConfig["baseUrl"];
        curl_setopt($ch, CURLOPT_URL,$url) ;  
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true) ;  
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true) ; 
        $output = curl_exec($ch) ;  
        preg_match("/formhash=(\w*)/",$output,$arr);
        $formhash = trim($arr[1]);
        preg_match('/id="umenu".*\n.*<a.*>(.*)<\/a>/',$output,$arr);
        $username = trim($arr[1]);
        if(!$username || !$formhash)continue;
        echo $formhash." ".$username;
        $userDict[$username] = array("formhash"=>$formhash);
        if($username != $task["name"]) continue;
        curl_close($ch);
    }
    if($task["type"] == "autopost"){
        $ch = curl_init();  
        if(isset($config["cookieName"])){
            curl_setopt($ch, CURLOPT_COOKIEJAR, $config["cookieName"]);  
            curl_setopt($ch, CURLOPT_COOKIEFILE, $config["cookieName"]); 
        }
        else{
            $header[]= 'Cookie: '.$config["cookiestr"];
            $header[]= 'User-Agent: '.$config["agent"]; 
            curl_setopt($ch,CURLOPT_HTTPHEADER,$header);   
        }
        $url = $gConfig["postUrl"];
        $url .= "?action=reply&tid={$config["tid"]}&replysubmit=yes&infloat=yes&handlekey=fastpost&inajax=1";
        $fields = array();
        $fields["formhash"] = $userDict[$task["name"]]["formhash"];
        $fields["subject"] = "";
        $fields["usesig"] = "1";
        $fields["message"] = iconv('UTF-8','GBK//IGNORE',$config["message"]);
        curl_setopt($ch, CURLOPT_URL,$url) ;  
        curl_setopt($ch, CURLOPT_POST,count($fields)) ; 
        curl_setopt($ch, CURLOPT_POSTFIELDS,$fields); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true) ; 
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true) ; 
        $output = curl_exec($ch) ;  
        echo iconv('GBK','UTF-8//IGNORE',$output);
        curl_close($ch);
        sleep(3);
    }
}
?>
