<?php
$dbConfig['hostname'] = 'localhost';
$dbConfig['username'] = 'root';
$dbConfig['password'] = '52myself';
$dbConfig['database'] = 'HiPDA';
class DB
{
    function __construct()
    {
        $this->db = NULL;
        $this->stmt = NULL;
        global $dbConfig;
        $this->db = new mysqli($dbConfig['hostname'], $dbConfig['username'], $dbConfig['password'], $dbConfig['database']);
        if (mysqli_connect_errno()) {
            printf("Connect failed: %s\n", mysqli_connect_error());
            $this->db = NULL;
        }
        if (!$this->db->set_charset("utf8")) {
            printf("Error loading character set utf8: %s\n", $this->db->error);
        }
    }

    function real_escape_string($str)
    {
        return $this->db->real_escape_string($str);
    }
    function query($queryStr)
    {
        return $this->db->query($queryStr);
    }

    function autocommit($flag)
    {
        return $this->db->autocommit($flag);
    }

    function commit()
    {
        return $this->db->commit();
    }
    function prepare($queryStr)
    {
        if($this->stmt!==NULL)$this->stmt->close();
        $this->stmt = $this->db->prepare($queryStr);
        if($this->stmt===false)return false;
        else return true;
    }

    function bind_param()
    {
        return call_user_func_array(array($this->stmt,'bind_param'), func_get_args());
    }

    function insert()
    {
        $stmt = $this->stmt;
        return $stmt->execute(); 
    }
    function listArray()
    {
        $stmt = $this->stmt;
        if(!$stmt->execute()) return false;
        $result = $stmt->get_result();
        if($result===false) return false;
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    function getArray()
    {
        $stmt = $this->stmt;
        if(!$stmt->execute()) return false;
        $result = $stmt->get_result();
        if($result===false) return false;
        return $result->fetch_array(MYSQLI_ASSOC);
    }

    function __destruct()
    {
        if($this->db) $this->db->close();
    }
}
?>
