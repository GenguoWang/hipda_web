<?php
    require_once("config.php");
    require_once("db.php");
    require_once("functions.php");
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
        $oldName = $cookieName;
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
        if($url== $gConfig["logUrl"]){
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
            $fields["ip"] = $cip;
            $fields["agent"] = $cag;
        };
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
    else if($args[0]=="HttpPostFile"){
        $url = $args[2];
        $fields = array();
        $ps = json_decode($args[3],true);
        foreach($ps as $item){
            $fields[$item["Key"]] = iconv('UTF-8','GBK//IGNORE',$item["Value"]);
        }
        $name = $_FILES[$args[4]]["tmp_name"];
        $mime = $_FILES[$args[4]]["type"];
        $size = $_FILES[$args[4]]["size"];
        if($mime=="image/jpeg" || $mime == "image/png"){
            $img = resize_image($name,1024,1024);
            $tmpfname = tempnam("/tmp", "img");
            $tmpfname.= ".jpg";
            imagejpeg($img,$tmpfname,80);
            $fields[$args[4]] = "@".$tmpfname.';type=image/jpeg';
        }
        else if($size > 350*1024){
            die("not supported size");
        }
        else if($mime=="image/gif"){
            rename($name,$name.".gif");
            $fields[$args[4]] = "@".$name.'.gif;type=image/gif';
        }
        else if($mime=="image/bmp"){
            rename($name,$name.".bmp");
            $fields[$args[4]] = "@".$name.'.bmp;type=image/bmp';
        }
        else{
            die("not supported type");
        }
        curl_setopt($ch, CURLOPT_URL,$url) ;  
        curl_setopt($ch, CURLOPT_POST,count($fields)) ; 
        curl_setopt($ch, CURLOPT_POSTFIELDS,$fields); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true) ; 
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true) ; 
        $output = curl_exec($ch) ;  
        echo $output;
        //echo iconv('GBK','UTF-8//IGNORE',$output);
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
        $db = new DB();
        $type = "autopost";
        $name = $args[2];
        $config = json_decode($args[3],true);
        if($name && $config){
            if(isset($cookieName)){
                $newName = $gConfig["taskdir"].$oldName;
                copy($cookieName,$newName);
                $config["cookieName"] = $newName;
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
        else{
            echo "用户名或参数错误";
        }
    }
    else if($args[0]=="DeleteAutoPost")
    {
        $db = new DB();
        $name = $args[2];
        $id = intval($args[3]);
        $db->prepare("delete from task where name = ? and id = ?");
        $db->bind_param("si",$name,$id);
        $res = $db->execute();
        if($res) echo "success";
        else echo "error";
    }
    else if($args[0]=="GetAutoList")
    {
        $db = new DB();
        $name = $args[2];
        $db->prepare("select * from task where name = ?");
        $db->bind_param("s",$name);
        $res = $db->listArray();
        echo json_encode($res);
    }
    curl_close($ch);
?>
