<?php
    header("Content-type: text/plain; charset=utf-8");
    /*
    $ch = curl_init("http://www.hi-pda.com/forum/") ;  
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true) ;
    curl_setopt($ch, CURLOPT_BINARYTRANSFER, true) ;
    $output = curl_exec($ch) ;  
    echo iconv('GB2312','UTF-8',$output);
    */
    $cookieName = "/tmp/".$_POST["cookie"];
    $args = $_POST["args"];
    $args = json_decode($args,true);
    $ch = curl_init() ;  
    $ch = curl_init() ;  
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieName);  
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieName); 
    if($args[0] == "HttpPost")
    {
        $url = $args[2];
        $fields = array();
        $ps = json_decode($args[3],true);
        foreach($ps as $item){
            $fields[$item["Key"]] = iconv('UTF-8','GBK//IGNORE',$item["Value"]);
        }
        curl_setopt($ch, CURLOPT_URL,$url) ;  
        curl_setopt($ch, CURLOPT_POST,count($fields)) ; 
        curl_setopt($ch, CURLOPT_POSTFIELDS,$fields); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true) ; 
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true) ; 
        $output = curl_exec($ch) ;  
        echo iconv('GBK','UTF-8//IGNORE',$output);
        //echo $output;
    }
    else if($args[0]=="HttpGet")
    {
        $url = $args[2];
        curl_setopt($ch, CURLOPT_URL,$url) ;  
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true) ;  
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true) ; 
        $output = curl_exec($ch) ;  
        echo iconv('GBK','UTF-8//IGNORE',$output);
        //echo $output;
    }
    else if($args[0]=="LoadPage")
    {
        $path = $args[2];
        if(!preg_match('/^(?:[a-z0-9_-]|\.(?!\.))+$/iD', $path)){
            //echo $path;
            //die("bad file");
        }
        echo file_get_contents($path);
    }
    curl_close($ch);
?>
