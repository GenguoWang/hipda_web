<?php
    require_once("config.php");
    header("Content-type: text/plain; charset=utf-8");
    /*
    $ch = curl_init("http://www.hi-pda.com/forum/") ;  
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true) ;
    curl_setopt($ch, CURLOPT_BINARYTRANSFER, true) ;
    $output = curl_exec($ch) ;  
    echo iconv('GB2312','UTF-8',$output);
    */
    $args = $_POST["args"];
    $args = json_decode($args,true);
    $ch = curl_init();  
    if(isset($_POST["cookiestr"])){
        $header[]= 'Cookie: '.$_POST["cookiestr"];
        $header[]= 'User-Agent: '.$_POST["agent"]; 
        curl_setopt($ch,CURLOPT_HTTPHEADER,$header);   
    }
    else if(isset($_POST["cookie"])){
        $cookieName = $_POST["cookie"];
        if(!preg_match('/^(?:[a-z0-9_-]|\.(?!\.))+$/iD', $cookieName)){
            echo $cookieName;
            die("bad file");
        }
        $cookieName = $gConfig["cookiedir"].$cookieName;
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieName);  
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieName); 
    }
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
        if(!preg_match('#pages/\w+/\w+\.\w+#', $path)){
            echo $path;
            die("bad file");
        }
        echo file_get_contents($path);
    }
    else if($args[0]=="AutoPost")
    {
        require_once("db.php");
        $db = new DB();
        $type = "autopost";
        $name = $args[2];
        $config = json_decode($args[3],true);
        if(isset($cookieName)){
            $config["cookieName"] = $cookieName;
        }
        else{
            $config["cookiestr"]= $_POST["cookiestr"];
            $header["agent"]= $_POST["agent"]; 
        }
        $config = json_encode($config);
        $db->prepare("select count(*) as num from task where name = ?");
        $db->bind_param("s",$name);
        $cnt = $db->getArray();
        $cnt = $cnt["num"];
        if($cnt > 0){
            echo "已有{$cnt}个自动顶贴,无法再添加";
        }
        else{
            $db->prepare("insert into task (name,type,config,time) values (?, ? , ?, now())");
            $db->bind_param("sss",$name,$type,$config);
            $res = $db->insert();
            if($res)
            {
                echo "success";
            }
            else
            {
                echo "error";
            }
        }
    }
    curl_close($ch);
?>
